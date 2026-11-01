import * as engine from './engine.js';
import { splitStatements } from './lexicon.js';
import { formatValue } from './format.js';

function toGrid(result) {
  if (!result) return { fields: [], rows: [] };
  const fields = (result.fields ?? []).map(f => typeof f === 'string' ? { name: f.toLowerCase(), id: null } : f);
  const rows = (result.rows ?? []).map(r =>
    fields.map(f => formatValue(r[f.name], f.id)).join(' | '),
  );
  return { fields: fields.map(f => f.name), rows };
}

function lastRowsResult(run) {
  for (let i = run.results.length - 1; i >= 0; i--) {
    const r = run.results[i];
    if (r.ok && r.fields.length > 0) return r;
  }
  return null;
}

async function withSeed(seed, fn) {
  await engine.resetSchema();
  if (seed && seed.trim()) await engine.exec(seed);
  return fn();
}

async function captureStudent(task, sql) {
  return withSeed(task.seed, async () => {
    const run = await engine.runScript(sql);
    if (!run.ranAll) {
      const failed = run.results[run.results.length - 1];
      return { error: failed?.error ?? { message: 'statement failed' }, run };
    }
    const kind = task.check ?? 'rows';
    if (kind === 'rows' || kind === 'ordered') return { grid: toGrid(lastRowsResult(run)), run };
    if (kind === 'table') return { grid: toGrid(await engine.tableRows(task.checkTable)), run };
    if (kind === 'schema') return { shape: await engine.describeTable(task.checkTable), run };
    if (kind === 'catalog') return { names: await engine.listDatabases(), run };
    return { error: { message: `unknown check kind: ${kind}` }, run };
  });
}

function compareGrids(expected, got, ordered) {
  const notes = [];
  const exp = [...expected.rows];
  const act = [...got.rows];

  if (ordered) {
    const n = Math.max(exp.length, act.length);
    for (let i = 0; i < n; i++) {
      if (exp[i] === act[i]) continue;
      notes.push({
        code: 'CHK-ROW',
        en: `Row ${i + 1} differs — expected ${exp[i] ?? '(no row)'}, you returned ${act[i] ?? '(no row)'}.`,
        zh: `第 ${i + 1} 行不一致：应为 ${exp[i] ?? '（无此行）'}，你的结果是 ${act[i] ?? '（无此行）'}。`,
      });
    }
  } else {
    const want = exp.slice().sort();
    const have = act.slice().sort();
    const missing = want.filter(r => !have.includes(r));
    const extra = have.filter(r => !want.includes(r));
    for (const r of missing.slice(0, 4)) {
      notes.push({ code: 'CHK-ROW-MISSING', en: `Missing row: ${r}`, zh: `缺少这一行：${r}` });
    }
    for (const r of extra.slice(0, 4)) {
      notes.push({ code: 'CHK-ROW-EXTRA', en: `Unexpected row: ${r}`, zh: `多出了这一行：${r}` });
    }
    if (!notes.length && exp.length !== act.length) {
      notes.push({
        code: 'CHK-COUNT', en: `Expected ${exp.length} rows, got ${act.length}.`,
        zh: `应返回 ${exp.length} 行，实际 ${act.length} 行。`,
      });
    }
  }
  return notes;
}

function compareShapes(expected, got) {
  const notes = [];
  const expCols = new Map(expected.columns.map(c => [c.name, c]));
  const gotCols = new Map(got.columns.map(c => [c.name, c]));

  for (const [name, c] of expCols) {
    if (!gotCols.has(name)) {
      notes.push({ code: 'CHK-COL-MISSING', en: `Column ${name} is missing.`, zh: `缺少字段 ${name}。` });
      continue;
    }
    const g = gotCols.get(name);
    if (g.type !== c.type || (c.length && g.length !== c.length)) {
      notes.push({
        code: 'CHK-COL-TYPE',
        en: `Column ${name} should be ${c.type}${c.length ? `(${c.length})` : ''}, you used ${g.type}${g.length ? `(${g.length})` : ''}.`,
        zh: `字段 ${name} 应为 ${c.type}${c.length ? `(${c.length})` : ''}，你写的是 ${g.type}${g.length ? `(${g.length})` : ''}。`,
      });
    }
  }
  for (const name of gotCols.keys()) {
    if (!expCols.has(name)) {
      notes.push({ code: 'CHK-COL-EXTRA', en: `Column ${name} was not asked for.`, zh: `多了未要求的字段 ${name}。` });
    }
  }

  const pkWant = expected.primaryKey.slice().sort().join(',');
  const pkGot = got.primaryKey.slice().sort().join(',');
  if (pkWant !== pkGot) {
    notes.push({
      code: 'CHK-PK',
      en: pkWant
        ? `Primary key should be ${pkWant}, you have ${pkGot || 'none'}.`
        : `This table should not have a primary key; you set ${pkGot}.`,
      zh: pkWant
        ? `主键应为 ${pkWant}，你的是 ${pkGot || '（没有主键）'}。`
        : `这张表不应设置主键，你设置了 ${pkGot}。`,
    });
  }

  const fkKey = f => `${f.column}->${f.table}.${f.column2}`;
  const fkWant = expected.foreignKeys.map(fkKey).sort().join(',');
  const fkGot = got.foreignKeys.map(fkKey).sort().join(',');
  if (fkWant !== fkGot) {
    notes.push({
      code: 'CHK-FK',
      en: fkWant
        ? `Foreign key should be ${fkWant.replace('->', ' referencing ')}, you have ${fkGot ? fkGot.replace('->', ' referencing ') : 'none'}.`
        : `This table should not declare a foreign key; you declared ${fkGot}.`,
      zh: fkWant
        ? `外键应为 ${fkWant}，你的是 ${fkGot || '（没有外键）'}。`
        : `这张表不应声明外键，你声明了 ${fkGot}。`,
    });
  }
  return notes;
}

export async function checkAnswer(task, sql) {
  const student = await captureStudent(task, sql);

  if (student.error) {
    await engine.resetSchema();
    if (task.seed?.trim()) await engine.exec(task.seed);
    return {
      ok: false,
      verdict: 'error',
      notes: [{
        code: 'CHK-ENGINE',
        en: `Your statement did not execute: ${student.error.message}`,
        zh: `语句执行失败：${student.error.message}`,
      }],
    };
  }

  const model = await captureStudent(task, task.answer);
  const kind = task.check ?? 'rows';
  let notes = [];

  if (kind === 'rows' || kind === 'ordered') {
    if (model.error) notes = [{ code: 'CHK-MODEL', en: `Model answer failed: ${model.error.message}`, zh: '参考答案执行失败，请报告这个题目。' }];
    else notes = compareGrids(model.grid, student.grid, kind === 'ordered');
  } else if (kind === 'table') {
    notes = compareGrids(model.grid, student.grid, false);
  } else if (kind === 'schema') {
    notes = compareShapes(model.shape, student.shape);
  } else if (kind === 'catalog') {
    const want = (task.expectName ?? '').toLowerCase();
    const got = (student.names ?? []).map(n => n.toLowerCase());
    if (!want || got.includes(want)) notes = [];
    else notes = [{
      code: 'CHK-CATALOG',
      en: `No database named ${want} exists — CREATE DATABASE must name it exactly.`,
      zh: `系统中没有名为 ${want} 的数据库，CREATE DATABASE 需要精确写出库名。`,
    }];
  }

  await withSeed(task.seed, () => engine.runScript(sql));

  return {
    ok: notes.length === 0,
    verdict: notes.length ? 'wrong' : 'correct',
    kind,
    notes,
    student: student.grid ?? student.shape ?? student.names,
  };
}
