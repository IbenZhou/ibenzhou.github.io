import { TASKS, taskById } from "../js/practice/tasks.js";
import { checkSignature, runCase } from "../js/practice/judge.js";
import { GOLDENS } from "../js/practice/goldens.js";
import { defineThemes, registerLanguage, registerCompletion } from "../js/language.js";
import { dialectOf } from "../js/dialect.js";

const el = (id) => document.getElementById(id);
const dom = {
  list: el("task-list"), count: el("count"), progress: el("progress"), difficulty: el("difficulty"),
  wrong: el("wrong"), listNote: el("list-note"),
  theme: el("theme"), empty: el("empty"), task: el("task"), title: el("task-title"), meta: el("task-meta"),
  requirement: el("task-requirement"), prompt: el("task-prompt"), answer: el("task-answer"),
  taskFiles: el("task-files"),
  showAnswer: el("show-answer"), editor: el("editor"), check: el("check"), clear: el("clear"),
  verdict: el("verdict"), cases: el("cases"),
};

const STORE = {
  solved: "pseudocode9618.practice.solved",
  wrong: "pseudocode9618.practice.wrong",
  draft: (id) => `pseudocode9618.practice.draft.${id}`,
  theme: "pseudocode9618.theme",
};

const ORDER = new Map(
  [...TASKS]
    .sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id))
    .map((task, index) => [task.id, index + 1]),
);
const state = { current: null, solved: readSolved(), wrong: readWrong(), wrongOnly: false };
let editor = null;
let model = null;

function readWrong() {
  try { return JSON.parse(localStorage.getItem(STORE.wrong) || "{}"); } catch { return {}; }
}
function saveWrong() {
  try { localStorage.setItem(STORE.wrong, JSON.stringify(state.wrong)); } catch { /* private mode */ }
}
function recordWrong(id) {
  const previous = state.wrong[id];
  state.wrong[id] = { attempts: (previous ? previous.attempts : 0) + 1, last: Date.now() };
  saveWrong();
}
function clearWrong(id) {
  if (state.wrong[id] === undefined) return;
  delete state.wrong[id];
  saveWrong();
}
function wrongCount() {
  return Object.keys(state.wrong).length;
}

function readSolved() {
  try { return JSON.parse(localStorage.getItem(STORE.solved) || "{}"); } catch { return {}; }
}
function markSolved(id) {
  state.solved[id] = true;
  try { localStorage.setItem(STORE.solved, JSON.stringify(state.solved)); } catch { /* private mode */ }
}

// Prompts use `code` and **bold**; render them instead of showing the markers.
function renderInline(text) {
  const fragment = document.createDocumentFragment();
  const pattern = /(`([^`\n]+)`|\*\*([^*\n]+)\*\*)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) fragment.append(text.slice(last, match.index));
    if (match[2] !== undefined) {
      const code = document.createElement("code");
      code.textContent = match[2];
      fragment.append(code);
    } else {
      const strong = document.createElement("strong");
      strong.textContent = match[3];
      fragment.append(strong);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) fragment.append(text.slice(last));
  return fragment;
}

function isTableRow(line) { return /^\s*\|.*\|\s*$/.test(line); }
function isBullet(line) { return /^\s*[-*]\s+/.test(line); }
function isNumbered(line) { return /^\s*\d+\.\s+/.test(line); }

function cellText(cell) {
  return cell.trim();
}

function buildTable(rows) {
  const table = document.createElement("table");
  const parsed = rows.map((row) => row.replace(/^\s*\||\|\s*$/g, "").split("|").map(cellText));
  const separator = parsed.length > 1 && parsed[1].every((cell) => /^:?-{2,}:?$/.test(cell));
  const header = parsed[0];
  const body = separator ? parsed.slice(2) : parsed.slice(1);
  const head = document.createElement("tr");
  for (const cell of header) {
    const th = document.createElement("th");
    th.appendChild(renderInline(cell));
    head.appendChild(th);
  }
  table.appendChild(head);
  for (const row of body) {
    const tr = document.createElement("tr");
    for (const cell of row) {
      const td = document.createElement("td");
      td.appendChild(renderInline(cell));
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  return table;
}

// Prompts carry tables, bullet lists and numbered steps; render them as blocks
// instead of showing the markdown.
// Prompts were hard-wrapped at the source; join a broken sentence back up but keep
// breaks that carry meaning: after a colon and around short data lines.
function looksLikeData(line) {
  const text = line.trim();
  if (!text || text.length > 24) return false;
  if (/\s/.test(text)) return false;
  return !/[.,;:!?]$/.test(text);
}

function joinSoft(lines) {
  let out = "";
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (i > 0) {
      const previous = lines[i - 1].trim();
      const keepBreak = previous.endsWith(":") || looksLikeData(previous) || looksLikeData(line);
      out += keepBreak ? "\n" : " ";
    }
    out += line;
  }
  return out;
}

function renderPrompt(text) {
  const fragment = document.createDocumentFragment();
  const lines = text.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (isTableRow(line)) {
      const rows = [];
      while (i < lines.length && isTableRow(lines[i])) rows.push(lines[i++]);
      fragment.appendChild(buildTable(rows));
      continue;
    }
    if (/^\s*```/.test(line)) {
      i += 1;
      const code = [];
      while (i < lines.length && !/^\s*```/.test(lines[i])) { code.push(lines[i]); i += 1; }
      if (i < lines.length) i += 1;
      const pre = document.createElement("pre");
      pre.className = "code-block";
      pre.textContent = code.join("\n");
      fragment.appendChild(pre);
      continue;
    }
    if (isBullet(line)) {
      const list = document.createElement("ul");
      while (i < lines.length && isBullet(lines[i])) {
        const li = document.createElement("li");
        li.appendChild(renderInline(lines[i].replace(/^\s*[-*]\s+/, "")));
        list.appendChild(li);
        i += 1;
      }
      fragment.appendChild(list);
      continue;
    }
    if (isNumbered(line)) {
      const list = document.createElement("ol");
      while (i < lines.length && isNumbered(lines[i])) {
        const li = document.createElement("li");
        li.appendChild(renderInline(lines[i].replace(/^\s*\d+\.\s+/, "")));
        list.appendChild(li);
        i += 1;
      }
      fragment.appendChild(list);
      continue;
    }
    if (line.trim() === "") { i += 1; continue; }
    const paragraph = [];
    while (i < lines.length && lines[i].trim() !== "" && !isTableRow(lines[i]) && !isBullet(lines[i]) && !isNumbered(lines[i])) {
      paragraph.push(lines[i]);
      i += 1;
    }
    const p = document.createElement("p");
    p.appendChild(renderInline(joinSoft(paragraph)));
    fragment.appendChild(p);
  }
  return fragment;
}

function stars(level) {
  return "★".repeat(level) + "☆".repeat(3 - level);
}

function detectTheme() {
  const stored = localStorage.getItem(STORE.theme);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function applyTheme(name) {
  document.documentElement.setAttribute("data-theme", name);
  if (window.monaco) monaco.editor.setTheme(`pc-${name}`);
}

function visibleTasks() {
  return TASKS
    .filter((task) => !state.difficulty || task.difficulty === state.difficulty)
    .filter((task) => !state.wrongOnly || state.wrong[task.id] !== undefined)
    .sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id));
}

function renderList() {
  dom.list.textContent = "";
  const tasks = visibleTasks();
  dom.count.textContent = `${tasks.length} / ${TASKS.length} 题`;
  const mistakes = wrongCount();
  dom.wrong.textContent = mistakes ? `错题本 ${mistakes}` : "错题本";
  dom.wrong.classList.toggle("active", state.wrongOnly);
  dom.listNote.hidden = !(state.wrongOnly && tasks.length === 0);
  dom.listNote.textContent = state.wrongOnly && tasks.length === 0
    ? "错题本是空的。做错的题会自动收进来,通过后自动移出。"
    : "";
  const solved = TASKS.filter((task) => state.solved[task.id]).length;
  if (dom.progress) dom.progress.textContent = `已通过 ${solved} / ${TASKS.length}`;
  for (const task of tasks) {
    const item = document.createElement("li");
    if (state.current && state.current.id === task.id) item.classList.add("active");
    if (state.solved[task.id]) item.classList.add("done");
    const row = document.createElement("div");
    row.className = "row";
    const no = document.createElement("span");
    no.className = "no";
    no.textContent = String(ORDER.get(task.id) || "").padStart(2, "0");
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = task.title;
    const right = document.createElement("span");
    right.className = "right";
    const star = document.createElement("span");
    star.className = "stars";
    star.textContent = stars(task.difficulty);
    const marks = document.createElement("span");
    marks.className = "marks";
    marks.textContent = `${task.marks} marks`;
    right.append(star, marks);
    row.append(no, name, right);
    item.append(row);
    item.addEventListener("click", () => select(task.id));
    dom.list.appendChild(item);
  }
}

function renderTaskFiles(files) {
  dom.taskFiles.textContent = "";
  const names = Object.keys(files || {});
  if (!names.length) { dom.taskFiles.hidden = true; return; }
  dom.taskFiles.hidden = false;
  const heading = document.createElement("h3");
  heading.textContent = "题目给的文件";
  dom.taskFiles.appendChild(heading);
  for (const name of names) {
    const block = document.createElement("div");
    block.className = "file";
    const label = document.createElement("span");
    label.className = "file-name";
    label.textContent = name;
    const body = document.createElement("pre");
    body.textContent = Array.isArray(files[name]) ? files[name].join("\n") : String(files[name]);
    block.append(label, body);
    dom.taskFiles.appendChild(block);
  }
}

function select(id) {
  const task = taskById(id);
  if (!task) return;
  state.current = task;
  dom.empty.hidden = true;
  dom.task.hidden = false;
  dom.title.textContent = task.title;
  dom.meta.textContent = `第 ${ORDER.get(task.id) || "?"} 题 · ${task.source} · ${task.marks} marks · ${stars(task.difficulty)}`;
  dom.requirement.textContent = task.requirement;
  dom.prompt.textContent = "";
  dom.prompt.appendChild(renderPrompt(task.prompt));
  dom.answer.textContent = task.model;
  dom.answer.hidden = true;
  dom.showAnswer.hidden = true;
  dom.showAnswer.textContent = "查看参考答案";
  dom.verdict.textContent = "";
  dom.verdict.className = "verdict";
  dom.cases.textContent = "";
  renderTaskFiles(task.files || (task.cases[0] && task.cases[0].files));
  model.setValue(localStorage.getItem(STORE.draft(task.id)) || "");
  renderList();
  const url = new URL(location.href);
  url.searchParams.set("task", task.id);
  history.replaceState(null, "", url);
  editor.focus();
}

function forbiddenHit(task, code) {
  for (const name of task.forbidden || []) {
    if (new RegExp(`\\b${name}\\s*\\(`).test(code)) return name;
  }
  return null;
}

function check() {
  const task = state.current;
  if (!task) return;
  const code = model.getValue();
  const goldens = GOLDENS[task.id] || [];

  const blocked = forbiddenHit(task, code);
  if (blocked) {
    dom.verdict.textContent = `这道题不允许使用 ${blocked}()`;
    dom.verdict.className = "verdict bad";
    dom.cases.textContent = "";
    return;
  }

  const sig = checkSignature(task, code);
  const rows = task.cases.map((entry, index) => {
    if (!sig.ok) return { entry, ok: false, note: sig.note, index };
    const run = runCase(task, entry, code);
    const ok = run.ok === null ? run.value === goldens[index] : run.ok;
    return { entry, ok, note: run.note || (ok ? "" : "输出与预期不符"), index };
  });
  if (!rows.length) rows.push({ entry: { label: task.requirement }, ok: sig.ok, note: sig.note, index: 0 });
  const passed = rows.filter((row) => row.ok).length;

  dom.cases.textContent = "";
  for (const row of rows) {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = row.entry.label;
    const mark = document.createElement("span");
    mark.className = row.ok ? "pass" : "fail";
    mark.textContent = row.ok ? "✓" : "✗";
    li.append(mark, label);
    if (row.note) {
      const note = document.createElement("span");
      note.className = "note";
      note.textContent = row.note;
      li.appendChild(note);
    }
    dom.cases.appendChild(li);
  }

  dom.showAnswer.hidden = false;
  const all = passed === rows.length;
  if (all) clearWrong(task.id);
  else recordWrong(task.id);
  dom.verdict.textContent = all ? `全部通过（${rows.length} 组用例）` : `通过 ${passed} / ${rows.length} 组`;
  dom.verdict.className = `verdict ${all ? "ok" : "bad"}`;
  if (all) markSolved(task.id);
  renderList();
}

function boot() {
  defineThemes();
  registerLanguage(() => dialectOf("9618"));
  registerCompletion(() => dialectOf("9618"));
  applyTheme(detectTheme());

  model = monaco.editor.createModel("", "pseudocode");
  editor = monaco.editor.create(dom.editor, {
    model,
    fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
    fontSize: 14,
    minimap: { enabled: false },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    tabSize: 4,
    insertSpaces: true,
    padding: { top: 8 },
  });

  renderList();

  model.onDidChangeContent(() => {
    if (!state.current) return;
    try { localStorage.setItem(STORE.draft(state.current.id), model.getValue()); } catch { /* private mode */ }
  });

  dom.wrong.addEventListener("click", () => {
    state.wrongOnly = !state.wrongOnly;
    renderList();
  });
  dom.difficulty.addEventListener("change", () => {
    state.difficulty = Number(dom.difficulty.value);
    renderList();
  });
  dom.theme.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    localStorage.setItem(STORE.theme, next);
    applyTheme(next);
  });
  dom.showAnswer.addEventListener("click", () => {
    dom.answer.hidden = !dom.answer.hidden;
    dom.showAnswer.textContent = dom.answer.hidden ? "查看参考答案" : "收起参考答案";
  });
  dom.check.addEventListener("click", check);
  dom.clear.addEventListener("click", () => {
    if (!state.current) return;
    if (!model.getValue().trim() || confirm("清空这道题的代码?")) model.setValue("");
  });
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, check);

  const wanted = new URL(location.href).searchParams.get("task");
  if (wanted && taskById(wanted)) select(wanted);
}

window.require.config({ paths: { vs: "../vendor/monaco/vs" } });
window.require(["vs/editor/editor.main"], boot);
