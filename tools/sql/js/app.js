import * as engine from './engine.js';
import { police } from './policing.js';
import { checkAnswer } from './checker.js';
import { registerLanguage, splitStatements } from './lexicon.js';
import { loadTasks, browserRead } from './tasks.js';
import { GROUPS, ENTRIES } from './reference.js';
import { formatValue } from './format.js';
import * as store from './storage.js';

const $ = (id) => document.getElementById(id);

let monaco = null;
let editor = null;
let tasks = [];
let current = null;
let busy = false;

function setBusy(value) {
  busy = value;
  for (const id of ['run', 'reset', 'tasks']) {
    const el2 = $(id);
    if (el2) el2.disabled = value;
  }
  $('check').disabled = value || current?.kind === 'sandbox';
}

function oneLine(sql) {
  return sql.replace(/\s+/g, ' ').trim();
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderRich(node, text) {
  node.textContent = '';
  text.split('**').forEach((part, i) => {
    node.append(i % 2 ? el('strong', undefined, part) : document.createTextNode(part));
  });
}

function renderTaskCard(task) {
  $('task-title').textContent = task.title;
  const bits = [`§${task.section}`];
  if (task.marks) bits.push(`${task.marks} marks`);
  if (task.kind === 'sandbox') bits.push('free sandbox');
  $('task-meta').textContent = bits.join(' · ');

  const prompt = $('task-prompt');
  renderRich(prompt, task.prompt);
  prompt.hidden = !task.prompt;

  const schema = $('task-schema');
  schema.textContent = task.schema;
  schema.hidden = !task.schema;

  $('mode').textContent = task.kind === 'sandbox' ? 'sandbox · incremental run' : 'task · reset and run';
  $('check').disabled = task.kind === 'sandbox';
  $('verdict').hidden = true;
}

function renderDiagnostics(findings, run) {
  const host = $('diagnostics');
  host.textContent = '';

  for (const f of findings) {
    const box = el('div', `diag ${f.tier === 'reject' ? 'err' : 'warn'}${f.fix ? ' fix' : ''}`);
    box.append(el('span', 'code', f.code));
    box.append(document.createTextNode(f.en));
    box.append(el('span', 'zh', f.zh));
    if (f.fix) box.append(el('span', 'zh', `Fix: ${f.fix}`));
    host.append(box);
  }

  const failed = run?.results?.find(r => !r.ok);
  if (failed) {
    const box = el('div', 'diag err');
    box.append(el('span', 'code', 'PG-ERROR'));
    box.append(document.createTextNode(failed.error.message));
    if (failed.error.detail) box.append(el('span', 'zh', failed.error.detail));
    box.append(el('span', 'zh', `Statement ${failed.index + 1}: ${oneLine(failed.sql).slice(0, 80)}`));
    host.append(box);
  }

  host.hidden = host.children.length === 0;
}

function renderGrid(container, result) {
  if (!result.fields.length) {
    container.append(el('p', 'empty', result.affected !== null ? `${result.affected} row(s) affected.` : 'Statement executed.'));
    return;
  }
  if (!result.rows.length) {
    container.append(el('p', 'empty', 'No rows returned.'));
    return;
  }
  const table = el('table', 'grid');
  const head = el('tr');
  for (const f of result.fields) head.append(el('th', undefined, String(f.name)));
  table.append(head);

  for (const row of result.rows.slice(0, 200)) {
    const tr = el('tr');
    for (const f of result.fields) {
      const text = formatValue(row[f.name], f.id);
      const td = el('td', text === 'NULL' ? 'null' : undefined, text);
      tr.append(td);
    }
    table.append(tr);
  }
  container.append(table);
  if (result.rows.length > 200) {
    container.append(el('p', 'affected', `Showing the first 200 of ${result.rows.length} rows.`));
  }
}

function renderResults(run) {
  const host = $('results');
  host.textContent = '';

  if (!run || !run.results.length) {
    host.append(el('p', 'empty', 'Nothing to run yet — write some SQL and press Run.'));
    return;
  }

  for (const r of run.results) {
    const box = el('div', `stmt ${r.ok ? 'ok' : 'failed'}`);
    const head = el('div', 'stmt-head');
    head.append(el('span', 'idx', `${r.index + 1}`));
    head.append(el('span', 'sql', oneLine(r.sql)));
    head.append(el('span', undefined, r.ok ? '✓' : '✗'));
    box.append(head);
    if (r.ok) renderGrid(box, r);
    else box.append(el('p', 'affected', r.error.message));
    host.append(box);
  }

  if (!run.ranAll) {
    host.append(el('p', 'affected', 'Later statements were not executed.'));
  }
}

function shapeLine(table) {
  const lines = [`${table.table}(${table.columns.map(c => {
    const len = c.length ? `(${c.length})` : '';
    const key = table.primaryKey.includes(c.name) ? ' PK' : '';
    const fk = table.foreignKeys.find(f => f.column === c.name);
    return `${c.name} ${c.type}${len}${key}${fk ? ` FK→${fk.table}.${fk.column2}` : ''}`;
  }).join(', ')})`];
  return lines;
}

async function renderTree() {
  const host = $('tree');
  const showFor = current && (current.kind === 'ddl' || current.kind === 'sandbox' || current.check === 'schema');
  if (!showFor) { host.hidden = true; return; }

  const names = await engine.listTables();
  host.textContent = '';
  host.hidden = false;
  host.append(el('h3', undefined, names.length ? `Structure created so far · 已创建的结构` : 'Structure · no tables yet'));
  const body = el('div', 'tree-body');
  host.append(body);

  if (!names.length) {
    body.append(el('p', 'empty', 'This database is empty.'));
    return;
  }
  for (const n of names) {
    const shape = await engine.describeTable(n);
    body.append(el('div', 'col', shapeLine(shape)[0]));
  }
}

function renderVerdict(res) {
  const host = $('verdict');
  host.textContent = '';
  host.hidden = false;
  host.className = `verdict ${res.ok ? 'pass' : 'fail'}`;
  host.append(el('h3', undefined, res.ok ? 'Correct · 答案正确' : `Not yet · ${res.notes.length} issue(s)`));

  if (!res.ok) {
    const list = el('ul');
    for (const n of res.notes.slice(0, 8)) {
      const li = el('li');
      li.append(el('span', 'code', n.code));
      li.append(document.createTextNode(` ${n.en}`));
      li.append(el('span', 'zh', n.zh));
      list.append(li);
    }
    host.append(list);
  }
}

async function seedTask(task) {
  await engine.resetSchema();
  if (task.seed) await engine.exec(task.seed);
}

function collectFindings(text) {
  const all = [];
  for (const st of splitStatements(text)) {
    for (const f of police(st.text).findings) all.push({ ...f, start: st.start });
  }
  return all;
}

async function run() {
  if (!current || busy) return;
  const text = editor.getValue();
  store.saveBuffer(current.id, text);

  setBusy(true);
  try {
    const findings = collectFindings(text);
    const rejects = findings.filter(f => f.tier === 'reject');

    if (rejects.length) {
      renderDiagnostics(rejects, null);
      renderResults(null);
      $('results').append(el('p', 'affected', 'Refused before reaching the database — see the messages under the editor.'));
      return;
    }

    if (current.kind !== 'sandbox') await seedTask(current);
    const runResult = await engine.runScript(text);
    renderResults(runResult);
    renderDiagnostics(findings, runResult);
    await renderTree();
  } catch (e) {
    renderDiagnostics([], { results: [{ ok: false, index: 0, sql: text, error: { message: String(e?.message ?? e) } }] });
  } finally {
    setBusy(false);
  }
}

async function check() {
  if (!current || busy || current.kind === 'sandbox') return;
  const text = editor.getValue();
  store.saveBuffer(current.id, text);

  setBusy(true);
  try {
    const findings = collectFindings(text);
    const rejects = findings.filter(f => f.tier === 'reject');
    if (rejects.length) {
      renderDiagnostics(rejects, null);
      renderVerdict({ ok: false, notes: rejects.map(r => ({ code: r.code, en: r.en, zh: r.zh })), kind: current.check });
      await renderTree();
      return;
    }

    const res = await checkAnswer(current, text);
    renderVerdict(res);
    renderDiagnostics(findings, null);
    await renderTree();
  } catch (e) {
    renderVerdict({ ok: false, notes: [{ code: 'CHK-CRASH', en: String(e?.message ?? e), zh: '检查过程出错。' }] });
  } finally {
    setBusy(false);
    await renderTree();
  }
}

async function reset() {
  if (!current || busy) return;
  setBusy(true);
  try {
    await seedTask(current);
    if (current.kind === 'sandbox') editor.setValue(current.starter || '');
    store.saveBuffer(current.id, editor.getValue());
    renderResults(null);
    renderDiagnostics([], null);
    $('verdict').hidden = true;
    await renderTree();
  } finally {
    setBusy(false);
  }
}

function buildReference() {
  const host = $('reference-body');
  host.textContent = '';

  for (const group of GROUPS) {
    const box = el('div', 'ref-group');
    box.append(el('h3', undefined, `${group.label} · ${group.zh}`));

    for (const item of ENTRIES.filter(e => e.group === group.id)) {
      const row = el('div', 'ref-item');
      const title = el('div', 't');
      title.append(document.createTextNode(item.title));
      title.append(el('span', 'zh', item.zh));
      row.append(title);
      row.append(el('code', undefined, item.syntax));
      if (item.note) row.append(el('p', 'note', item.note));
      const btn = el('button', undefined, 'Insert example');
      btn.addEventListener('click', () => {
        editor.focus();
        editor.executeEdits('reference', [{ range: editor.getSelection(), text: item.insert, forceMoveMarkers: true }]);
      });
      row.append(btn);
      box.append(row);
    }
    host.append(box);
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  monaco?.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
  store.saveTheme(theme);
}

async function selectTask(id, { keepBuffer = true } = {}) {
  const task = tasks.find(t => t.id === id) ?? tasks[0];
  if (!task) return;

  if (current) store.saveBuffer(current.id, editor.getValue());
  current = task;
  store.saveSelected(task.id);

  renderTaskCard(task);
  editor.setValue((keepBuffer ? store.loadBuffer(task.id) : '') || task.starter || '');
  $('verdict').hidden = true;

  setBusy(true);
  try {
    await seedTask(task);
    renderResults(null);
    renderDiagnostics([], null);
    await renderTree();
  } finally {
    setBusy(false);
  }
}

function wireUi() {
  $('run').addEventListener('click', run);
  $('check').addEventListener('click', check);
  $('reset').addEventListener('click', reset);

  $('tasks').addEventListener('change', (e) => selectTask(e.target.value));
  $('theme').addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  const toggleReference = () => { $('reference').hidden = !$('reference').hidden; };
  $('reference-btn').addEventListener('click', toggleReference);
  $('reference-close').addEventListener('click', toggleReference);

  let saveTimer = null;
  editor.onDidChangeModelContent(() => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { if (current) store.saveBuffer(current.id, editor.getValue()); }, 250);
  });

  const pane = document.querySelector('.editor-pane');
  let dragging = false;
  $('divider').addEventListener('pointerdown', () => { dragging = true; });
  window.addEventListener('pointerup', () => { dragging = false; });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const total = document.querySelector('.split').getBoundingClientRect().width;
    const pct = Math.min(80, Math.max(25, (e.clientX / total) * 100));
    pane.style.flex = `0 0 ${pct}%`;
  });
}

function failBoot(message) {
  const boot = $('boot');
  boot.hidden = false;
  boot.textContent = '';
  const card = el('div', 'boot-card');
  card.append(el('p', undefined, 'Could not start the database engine'));
  card.append(el('p', 'boot-sub', message));
  boot.append(card);
}

async function start() {
  document.documentElement.dataset.theme = store.loadTheme();

  // Monaco's AMD loader resolves its worker against the page, which breaks once the tool
  // is served from a subdirectory, so hand it an absolute URL derived from this module.
  const vs = new URL('../vendor/monaco/vs', import.meta.url).href.replace(/\/$/, '');
  window.MonacoEnvironment = { getWorkerUrl: () => `${vs}/base/worker/workerMain.js` };
  window.require.config({ paths: { vs } });
  const editorReady = new Promise((resolve) => {
    window.require(['vs/editor/editor.main'], () => {
      monaco = window.monaco;
      registerLanguage(monaco);
      editor = monaco.editor.create($('editor'), {
        value: '',
        language: 'sql9618',
        theme: document.documentElement.dataset.theme === 'dark' ? 'vs-dark' : 'vs',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbersMinChars: 3,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        renderLineHighlight: 'all',
      });
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, run);
      resolve();
    });
  });

  try {
    await Promise.all([editorReady, engine.boot()]);
    tasks = await loadTasks(browserRead);

    $('tasks').textContent = '';
    for (const t of tasks) {
      const opt = el('option', undefined, `${t.section} · ${t.title}`);
      opt.value = t.id;
      $('tasks').append(opt);
    }

    buildReference();
    wireUi();

    const saved = store.loadSelected();
    await selectTask(tasks.some(t => t.id === saved) ? saved : tasks[0].id);
    $('boot').hidden = true;
  } catch (e) {
    failBoot(String(e?.message ?? e));
  }
}

start();
