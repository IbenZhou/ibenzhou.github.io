import { meaningful } from './lexicon.js';

const CLAUSE_STOP = new Set([
  'WHERE', 'GROUP', 'ORDER', 'JOIN', 'ON', 'USING', 'HAVING', 'LIMIT',
  'OFFSET', 'UNION', 'INTERSECT', 'EXCEPT', 'SET', 'VALUES',
]);

export function analyze(sql) {
  const tokens = meaningful(sql);
  const words = tokens.map(t => t.text.toUpperCase());
  const has = w => words.includes(w);

  const tables = [];
  const joinKinds = [];
  let mode = null;
  let depth = 0;
  let subqueries = 0;
  let starSelects = 0;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const w = t.text.toUpperCase();

    if (t.type === 'punct') {
      if (w === '(') {
        depth++;
        const next = tokens[i + 1];
        if (next && next.text.toUpperCase() === 'SELECT') subqueries++;
      } else if (w === ')') depth--;
      else if (w === '*' && depth === 0 && mode === 'select') starSelects++;
      continue;
    }
    if (t.type === 'string' || t.type === 'qident') continue;

    if (w === 'SELECT') mode = 'select';
    else if (w === 'FROM') mode = 'from';
    else if (w === 'JOIN') mode = 'join';
    else if (CLAUSE_STOP.has(w) && w !== 'JOIN') mode = null;

    if (t.type === 'keyword' || t.type === 'ident') {
      if (mode === 'from' && depth === 0) {
        const prev = tokens[i - 1];
        const prevW = prev ? prev.text.toUpperCase() : '';
        if (prevW === ',' || prevW === 'FROM') tables.push(w);
      }
      if (mode === 'join' && depth === 0) {
        const prev = tokens[i - 1];
        if (prev && prev.text.toUpperCase() === 'JOIN') tables.push(w);
      }
    }

    if (['LEFT', 'RIGHT', 'FULL', 'CROSS', 'NATURAL'].includes(w)) {
      const later = tokens.slice(i + 1, i + 4).map(x => x.text.toUpperCase());
      if (later.includes('JOIN')) joinKinds.push(w);
    }
  }

  return {
    words,
    has,
    tables: [...new Set(tables)],
    joinKinds: [...new Set(joinKinds)],
    subqueries,
    starSelects,
    leading: words.slice(0, 3).join(' '),
  };
}

const SYLLABUS_TYPES = new Set([
  'CHARACTER', 'VARCHAR', 'BOOLEAN', 'INTEGER', 'REAL', 'DATE', 'TIME',
]);

const EXTRA_TYPES = [
  'TEXT', 'NVARCHAR', 'NCHAR', 'INT', 'SMALLINT', 'BIGINT', 'FLOAT', 'DOUBLE',
  'DECIMAL', 'NUMERIC', 'MONEY', 'SERIAL', 'TIMESTAMP', 'DATETIME', 'UUID',
  'JSON', 'JSONB', 'BLOB', 'CLOB',
];

const FOREIGN_STATEMENTS = [
  ['TRUNCATE', 'TRUNCATE TABLE'],
  ['GRANT', 'GRANT'], ['REVOKE', 'REVOKE'],
  ['CALL', 'CALL'], ['DO', 'DO'],
  ['PREPARE', 'PREPARE'], ['EXECUTE', 'EXECUTE'], ['MERGE', 'MERGE'],
];

export const RULES = [
  {
    id: 'two-tables', tier: 'reject', code: 'POL-TWO-TABLES',
    test: a => a.tables.length > 2,
    found: a => `${a.tables.length}`,
    en: 'This statement refers to {n} tables. The 9618 DML subset covers queries over at most two tables.',
    zh: '该语句涉及 {n} 张表，考纲的 DML 范围最多只到两张表。',
    fix: 'Rewrite it so that only two tables appear in FROM / JOIN.',
  },
  {
    id: 'outside-ddl-dml', tier: 'reject', code: 'POL-OUTSIDE',
    test: a => FOREIGN_STATEMENTS.some(([w]) => a.words.includes(w)),
    found: a => FOREIGN_STATEMENTS.find(([w]) => a.words.includes(w))?.[1] ?? '',
    en: '{found} is not part of the 9618 DDL or DML subset.',
    zh: '{found} 不属于考纲要求的 DDL / DML 范围。',
    fix: 'Use only CREATE DATABASE / CREATE TABLE / ALTER TABLE and SELECT / INSERT / UPDATE / DELETE.',
  },
  {
    id: 'max-min', tier: 'warn', code: 'POL-AGGREGATE',
    test: a => ['MAX', 'MIN'].some(f => a.words.includes(f)),
    found: a => a.words.find(w => ['MAX', 'MIN'].includes(w)) ?? '',
    en: 'MAX and MIN work, but the syllabus lists only SUM, COUNT and AVG.',
    zh: 'MAX / MIN 可以运行，但考纲只要求 SUM、COUNT、AVG 三个聚合函数。',
  },
  {
    id: 'distinct', tier: 'warn', code: 'POL-DISTINCT',
    test: a => a.has('DISTINCT'),
    found: () => 'DISTINCT',
    en: 'DISTINCT is outside the listed subset.',
    zh: 'DISTINCT 不在考纲列出的关键字范围内。',
  },
  {
    id: 'having', tier: 'warn', code: 'POL-HAVING',
    test: a => a.has('HAVING'),
    found: () => 'HAVING',
    en: 'HAVING is not in the 9618 DML subset; GROUP BY is.',
    zh: '考纲只要求 GROUP BY，没有列出 HAVING。',
  },
  {
    id: 'limit', tier: 'warn', code: 'POL-LIMIT',
    test: a => a.has('LIMIT') || a.has('OFFSET') || a.has('TOP'),
    found: a => ['LIMIT', 'OFFSET', 'TOP'].find(w => a.has(w)) ?? '',
    en: 'LIMIT is not part of the syllabus subset and exam answers do not use it.',
    zh: 'LIMIT / OFFSET 不属于考纲范围，答卷中也不会出现。',
  },
  {
    id: 'pattern-match', tier: 'warn', code: 'POL-PATTERN',
    test: a => a.has('LIKE') || a.has('ILIKE') || a.has('BETWEEN'),
    found: a => ['LIKE', 'ILIKE', 'BETWEEN'].find(w => a.has(w)) ?? '',
    en: '{found} is a valid condition but is not one of the listed 9618 clauses.',
    zh: '{found} 语法有效，但不在考纲列出的子句之内。',
  },
  {
    id: 'outer-join', tier: 'warn', code: 'POL-JOIN-KIND',
    test: a => a.joinKinds.length > 0,
    found: a => `${a.joinKinds.join(' / ')} JOIN`,
    en: 'Only INNER JOIN is in the syllabus; you used {found}.',
    zh: '考纲只要求 INNER JOIN，你用的是 {found}。',
  },
  {
    id: 'subquery', tier: 'warn', code: 'POL-SUBQUERY',
    test: a => a.subqueries > 0 || a.has('EXISTS'),
    found: a => a.has('EXISTS') ? 'EXISTS' : 'a nested query',
    en: 'Nested queries are outside the 9618 subset; use an INNER JOIN instead.',
    zh: '子查询超出考纲范围，这里应改用 INNER JOIN。',
  },
  {
    id: 'set-op', tier: 'warn', code: 'POL-SET-OP',
    test: a => ['UNION', 'INTERSECT', 'EXCEPT', 'WITH'].some(w => a.words.includes(w)),
    found: a => ['UNION', 'INTERSECT', 'EXCEPT', 'WITH'].find(w => a.words.includes(w)) ?? '',
    en: 'Set operations and CTEs are outside the syllabus subset.',
    zh: '集合运算与 CTE 不在考纲范围内。',
  },
  {
    id: 'window', tier: 'warn', code: 'POL-WINDOW',
    test: a => a.has('OVER') || a.has('PARTITION'),
    found: a => ['OVER', 'PARTITION'].find(w => a.has(w)) ?? '',
    en: 'Window functions are well beyond the 9618 subset.',
    zh: '窗口函数远超考纲范围。',
  },
  {
    id: 'select-star', tier: 'warn', code: 'POL-STAR',
    test: a => a.starSelects > 0,
    found: () => 'SELECT *',
    en: 'SELECT * returns every column; exam questions usually name the fields they want.',
    zh: 'SELECT * 会返回所有列，题目通常会点名需要的字段。',
  },
  {
    id: 'drop', tier: 'warn', code: 'POL-DROP',
    test: a => a.has('DROP'),
    found: () => 'DROP',
    en: 'DROP is not in the syllabus DDL subset, and it destroys the table for later statements.',
    zh: 'DROP 不在考纲 DDL 范围内，并且会删掉后续语句要用的表。',
  },
  {
    id: 'unfiltered-write', tier: 'warn', code: 'POL-NO-WHERE',
    test: a => (a.has('UPDATE') || a.has('DELETE')) && !a.has('WHERE'),
    found: a => a.has('UPDATE') ? 'UPDATE' : 'DELETE',
    en: 'This UPDATE / DELETE has no WHERE, so it affects every row in the table.',
    zh: '这条 UPDATE / DELETE 没有 WHERE 条件，会影响表中所有记录。',
  },
  {
    id: 'extra-type', tier: 'warn', code: 'POL-TYPE',
    test: a => EXTRA_TYPES.some(t => a.words.includes(t)),
    found: a => EXTRA_TYPES.find(t => a.words.includes(t)) ?? '',
    en: '{found} is not one of the seven syllabus data types (CHARACTER, VARCHAR(n), BOOLEAN, INTEGER, REAL, DATE, TIME).',
    zh: '{found} 不属于考纲列出的七种数据类型。',
  },
];

function fill(template, value) {
  return template.replaceAll('{n}', value.n ?? '').replaceAll('{found}', value.found ?? '');
}

export function police(sql) {
  const a = analyze(sql);
  const findings = [];
  for (const rule of RULES) {
    let hit = false;
    try { hit = rule.test(a); } catch { hit = false; }
    if (!hit) continue;

    const found = rule.found ? rule.found(a) : '';
    findings.push({
      tier: rule.tier,
      code: rule.code,
      rule: rule.id,
      en: fill(rule.en, { n: found, found }),
      zh: fill(rule.zh, { n: found, found }),
      fix: rule.fix,
    });
  }
  return { findings, analysis: a };
}
