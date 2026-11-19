import * as engine from './engine.js';
import { police } from './policing.js';
import { checkAnswer } from './checker.js';
import { registerLanguage, splitStatements } from './lexicon.js';
import { loadTasks } from './tasks.js';
import { formatValue } from './format.js';
import * as store from './storage.js';
import { clampFont, accumulateZoom } from './font-zoom.js';

const $ = (id) => document.getElementById(id);

const BANDS = [
  { id: 'basic', label: '基础', en: 'Basic' },
  { id: 'advanced', label: '进阶', en: 'Advanced' },
  { id: 'challenge', label: '挑战', en: 'Challenge' },
];

let monaco = null;
let editor = null;
let tasks = [];
let current = null;
let busy = false;
let fontSize = store.loadFontSize();
let done = new Set(store.loadDoneList());

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

// Paths resolve against this module, not the page: the page lives in training/ and the
// task files also live in training/, which would otherwise double the folder name.
const readFromModuleDir = async (rel) => {
  const res = await fetch(new URL(`../${rel}`, import.meta.url), { cache: 'no-cache' });
  return res.ok ? res.text() : null;
};

const oneLine = (sql) => sql.replace(/\s+/g, ' ').trim();

function renderRich(node, text) {
  node.textContent = '';
  text.split('**').forEach((part, i) => {
    node.append(i % 2 ? el('strong', undefined, part) : document.createTextNode(part));
  });
}

function setBusy(value) {
  busy = value;
  for (const id of ['run', 'reset']) $(id).disabled = value;
  $('check').disabled = value;
}

function bufferKey(task) {
  return `training.${task.id}`;
}

/* ---------------------------------------------------------------- list */

function renderList() {
  const host = $('list');
  host.textContent = '';

  for (const band of BANDS) {
    const group = tasks.filter(t => t.difficulty === band.id);
    if (!group.length) continue;

    const box = el('div', 'band');
    const head = el('h3', undefined, `${band.label} · ${band.en} · ${group.filter(t => done.has(t.id)).length}/${group.length}`);
    box.append(head);

    for (const task of group) {
      const btn = el('button', `task-item${task.id === current?.id ? ' active' : ''}${done.has(task.id) ? ' passed' : ''}`);
      btn.type = 'button';
      btn.append(el('span', 'tick', done.has(task.id) ? '✓' : ''));
      const name = el('span', 'name', task.title);
      name.append(el('span', 'meta', `${task.source} · ${task.marks} marks`));
      btn.append(name);
      btn.addEventListener('click', () => selectTask(task.id));
      box.append(btn);
    }
    host.append(box);
  }
}

function renderProgress() {
  $('progress').textContent = `${done.size} / ${tasks.length} 已完成`;
}

/* -------------------------------------------------------------- task UI */

function renderTaskCard(task) {
  $('task-title').textContent = task.title;
  const band = BANDS.find(b => b.id === task.difficulty);
  const bits = [`§${task.section}`, band ? `${band.label} · ${band.en}` : '', task.source, task.marks ? `${task.marks} marks` : ''];
  $('task-meta').textContent = bits.filter(Boolean).join(' · ');

  const prompt = $('task-prompt');
  renderRich(prompt, task.prompt);
  prompt.hidden = !task.prompt;

  const schema = $('task-schema');
  schema.textContent = task.schema;
  schema.hidden = !task.schema;
}

function renderDiagnostics(findings, run) {
  const host = $('diagnostics');
  host.textContent = '';

  for (const f of findings) {
    const box = el('div', `diag ${f.tier === 'reject' ? 'err' : 'warn'}${f.fix ? ' fix' : ''}`);
    box.append(el('span', 'code', f.code));
    box.append(document.createTextNode(f.en));
    box.append(el('span', 'zh', f.zh));
    host.append(box);
  }

  const failed = run?.results?.find(r => !r.ok);
  if (failed) {
    const box = el('div', 'diag err');
    box.append(el('span', 'code', 'PG-ERROR'));
    box.append(document.createTextNode(failed.error.message));
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
      tr.append(el('td', text === 'NULL' ? 'null' : undefined, text));
    }
    table.append(tr);
  }
  container.append(table);
}

function renderResults(run) {
  const host = $('results');
  host.textContent = '';
  if (!run || !run.results.length) {
    host.append(el('p', 'empty', 'Write your SQL and press Run.'));
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
}

async function renderTree() {
  const host = $('tree');
  const names = await engine.listTables();
  const show = current && (current.kind === 'ddl' || current.check === 'schema');
  if (!show) { host.hidden = true; return; }
  host.textContent = '';
  host.hidden = false;
  host.append(el('h3', undefined, names.length ? 'Structure created so far · 已创建的结构' : 'Structure · no tables yet'));
  const body = el('div', 'tree-body');
  host.append(body);
  if (!names.length) { body.append(el('p', 'empty', 'This database is empty.')); return; }
  for (const n of names) {
    const s = await engine.describeTable(n);
    const line = `${s.table}(${s.columns.map(c => {
      const len = c.length ? `(${c.length})` : '';
      const pk = s.primaryKey.includes(c.name) ? ' PK' : '';
      const fk = s.foreignKeys.find(f => f.column === c.name);
      return `${c.name} ${c.type}${len}${pk}${fk ? ` FK→${fk.table}.${fk.column2}` : ''}`;
    }).join(', ')})`;
    body.append(el('div', 'col', line));
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

    const reveal = el('button', undefined, '看参考答案 · Show model answer');
    const answer = el('pre', 'task-schema', current.answer);
    answer.hidden = true;
    reveal.addEventListener('click', () => { answer.hidden = !answer.hidden; });
    host.append(reveal, answer);
  }
}

/* ------------------------------------------------------------- actions */

function collectFindings(text, task) {
  const suppressed = new Set(task.suppress ?? []);
  const all = [];
  for (const st of splitStatements(text)) {
    for (const f of police(st.text).findings) {
      if (!suppressed.has(f.code)) all.push({ ...f, start: st.start });
    }
  }
  return all;
}

async function seedTask(task) {
  await engine.resetSchema();
  if (task.seed) await engine.exec(task.seed);
}

async function selectTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  if (current) store.saveBuffer(bufferKey(current), editor.getValue());
  current = task;

  renderTaskCard(task);
  renderList();
  editor.setValue(store.loadBuffer(bufferKey(task)) || '');
  $('verdict').hidden = true;
  renderResults(null);
  renderDiagnostics([], null);

  setBusy(true);
  try {
    await seedTask(task);
    await renderTree();
  } finally {
    setBusy(false);
  }
}

async function run() {
  if (!current || busy) return;
  const text = editor.getValue();
  store.saveBuffer(bufferKey(current), text);
  setBusy(true);
  try {
    const findings = collectFindings(text, current);
    const rejects = findings.filter(f => f.tier === 'reject');
    if (rejects.length) {
      renderDiagnostics(rejects, null);
      renderResults(null);
      return;
    }
    await seedTask(current);
    const result = await engine.runScript(text);
    renderResults(result);
    renderDiagnostics(findings, result);
    await renderTree();
  } finally {
    setBusy(false);
  }
}

async function check() {
  if (!current || busy) return;
  const text = editor.getValue();
  store.saveBuffer(bufferKey(current), text);
  setBusy(true);
  try {
    const findings = collectFindings(text, current);
    const rejects = findings.filter(f => f.tier === 'reject');
    if (rejects.length) {
      renderDiagnostics(rejects, null);
      renderVerdict({ ok: false, notes: rejects.map(r => ({ code: r.code, en: r.en, zh: r.zh })) });
      return;
    }
    const res = await checkAnswer(current, text);
    renderVerdict(res);
    renderDiagnostics(findings, null);
    if (res.ok) {
      done.add(current.id);
      store.markDone(current.id);
      renderList();
      renderProgress();
    }
    await renderTree();
  } finally {
    setBusy(false);
  }
}

async function reset() {
  if (!current || busy) return;
  setBusy(true);
  try {
    await seedTask(current);
    renderResults(null);
    renderDiagnostics([], null);
    $('verdict').hidden = true;
    await renderTree();
  } finally {
    setBusy(false);
  }
}

/* --------------------------------------------------------------- chrome */

function renderFontSize() {
  $('font-px').textContent = `${fontSize}px`;
  $('font-in').disabled = fontSize >= store.MAX_FONT;
  $('font-out').disabled = fontSize <= store.MIN_FONT;
}

function setFontSize(px) {
  fontSize = clampFont(px, store.MIN_FONT, store.MAX_FONT);
  store.saveFontSize(fontSize);
  editor?.updateOptions({ fontSize });
  renderFontSize();
}

function wireFontSize() {
  renderFontSize();
  $('font-in').addEventListener('click', () => setFontSize(fontSize + 1));
  $('font-out').addEventListener('click', () => setFontSize(fontSize - 1));
  let carry = 0;
  $('editor').addEventListener('wheel', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    e.stopPropagation();
    const step = accumulateZoom(carry, e);
    carry = step.carry;
    if (step.whole) setFontSize(fontSize + step.whole);
  }, { capture: true, passive: false });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  monaco?.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
  store.saveTheme(theme);
}

function wireUi() {
  $('run').addEventListener('click', run);
  $('check').addEventListener('click', check);
  $('reset').addEventListener('click', reset);
  $('theme').addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
  let timer = null;
  editor.onDidChangeModelContent(() => {
    clearTimeout(timer);
    timer = setTimeout(() => { if (current) store.saveBuffer(bufferKey(current), editor.getValue()); }, 250);
  });
}

function failBoot(message) {
  const boot = $('boot');
  boot.hidden = false;
  boot.textContent = '';
  const card = el('div', 'boot-card');
  card.append(el('p', undefined, 'Could not start the training ground'));
  card.append(el('p', 'boot-sub', message));
  boot.append(card);
}

async function start() {
  document.documentElement.dataset.theme = store.loadTheme();

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
        fontSize,
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
    tasks = await loadTasks(readFromModuleDir, 'training');
    done = new Set(store.loadDoneList());

    wireUi();
    wireFontSize();
    renderProgress();

    const firstUnfinished = tasks.find(t => !done.has(t.id)) ?? tasks[0];
    await selectTask(firstUnfinished.id);
    $('boot').hidden = true;
  } catch (e) {
    failBoot(String(e?.message ?? e));
  }
}

start();
