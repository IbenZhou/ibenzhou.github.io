import { TASKS, taskById, buildProgram, resultOf } from "../js/practice/tasks.js";
import { GOLDENS } from "../js/practice/goldens.js";
import { runSync } from "../js/engine.js";
import { defineThemes, registerLanguage, registerCompletion } from "../js/language.js";
import { dialectOf } from "../js/dialect.js";

const el = (id) => document.getElementById(id);
const dom = {
  list: el("task-list"), count: el("count"), difficulty: el("difficulty"), chapter: el("chapter"),
  theme: el("theme"), empty: el("empty"), task: el("task"), title: el("task-title"), meta: el("task-meta"),
  requirement: el("task-requirement"), prompt: el("task-prompt"), answer: el("task-answer"),
  showAnswer: el("show-answer"), editor: el("editor"), check: el("check"), clear: el("clear"),
  verdict: el("verdict"), cases: el("cases"),
};

const STORE = {
  solved: "pseudocode9618.practice.solved",
  draft: (id) => `pseudocode9618.practice.draft.${id}`,
  theme: "pseudocode9618.theme",
};

const state = { current: null, solved: readSolved() };
let editor = null;
let model = null;

function readSolved() {
  try { return JSON.parse(localStorage.getItem(STORE.solved) || "{}"); } catch { return {}; }
}
function markSolved(id) {
  state.solved[id] = true;
  try { localStorage.setItem(STORE.solved, JSON.stringify(state.solved)); } catch { /* private mode */ }
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

function buildChapterFilter() {
  const chapters = [...new Set(TASKS.map((task) => task.chapter))].sort();
  for (const chapter of chapters) {
    const option = document.createElement("option");
    option.value = chapter;
    option.textContent = chapter;
    dom.chapter.appendChild(option);
  }
}

function visibleTasks() {
  return TASKS
    .filter((task) => !state.difficulty || task.difficulty === state.difficulty)
    .filter((task) => !state.chapter || task.chapter === state.chapter)
    .sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id));
}

function renderList() {
  dom.list.textContent = "";
  const tasks = visibleTasks();
  dom.count.textContent = `${tasks.length} / ${TASKS.length} 题`;
  for (const task of tasks) {
    const item = document.createElement("li");
    if (state.current && state.current.id === task.id) item.classList.add("active");
    const row = document.createElement("div");
    row.className = "row";
    const name = document.createElement("span");
    name.className = "name" + (state.solved[task.id] ? " done" : "");
    name.textContent = task.title;
    const star = document.createElement("span");
    star.className = "stars";
    star.textContent = stars(task.difficulty);
    row.append(name, star);
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${task.marks} marks · ${task.chapter}`;
    item.append(row, meta);
    item.addEventListener("click", () => select(task.id));
    dom.list.appendChild(item);
  }
}

function select(id) {
  const task = taskById(id);
  if (!task) return;
  state.current = task;
  dom.empty.hidden = true;
  dom.task.hidden = false;
  dom.title.textContent = task.title;
  dom.meta.textContent = `${task.source} · ${task.marks} marks · ${stars(task.difficulty)}`;
  dom.requirement.textContent = task.requirement;
  dom.prompt.textContent = task.prompt;
  dom.answer.textContent = task.model;
  dom.answer.hidden = true;
  dom.showAnswer.textContent = "查看参考答案";
  dom.verdict.textContent = "";
  dom.verdict.className = "verdict";
  dom.cases.textContent = "";
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

  let passed = 0;
  const rows = task.cases.map((entry, index) => {
    const program = buildProgram(task, entry, code);
    const result = runSync(program, { inputs: entry.inputs || [] });
    let ok = false;
    let note = "";
    if (result.errors.length) {
      const first = result.errors[0];
      note = `第 ${first.line} 行:${first.en}`;
    } else {
      ok = resultOf(result.output) === goldens[index];
      if (!ok) note = "输出与预期不符";
    }
    if (ok) passed++;
    return { entry, ok, note, index };
  });

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

  const all = passed === rows.length;
  dom.verdict.textContent = all ? `全部通过（${rows.length} 组用例）` : `通过 ${passed} / ${rows.length} 组`;
  dom.verdict.className = `verdict ${all ? "ok" : "bad"}`;
  if (all) {
    markSolved(task.id);
    renderList();
  }
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

  buildChapterFilter();
  renderList();

  model.onDidChangeContent(() => {
    if (!state.current) return;
    try { localStorage.setItem(STORE.draft(state.current.id), model.getValue()); } catch { /* private mode */ }
  });

  dom.difficulty.addEventListener("change", () => {
    state.difficulty = Number(dom.difficulty.value);
    renderList();
  });
  dom.chapter.addEventListener("change", () => {
    state.chapter = dom.chapter.value;
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
