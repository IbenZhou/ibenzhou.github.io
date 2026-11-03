import { DATASETS } from "./datasets.js";
import { EXAMPLES } from "./examples.js";
import { REFERENCE_HTML } from "./reference.js";
import { RUNNER_SOURCE } from "./runner-source.js";
import * as store from "./storage.js";
import { encodeState, decodeState } from "./share.js";
import {
  detectMainClassName,
  sourceFileNameFor,
  sanitizeFileName,
  uniqueName,
  parseCompileOutput,
  parseRuntimeError,
  findPitfalls,
  hasMainMethod,
} from "./diagnostics.js";
import { registerJavaLanguage } from "./java-language.js";
import { clampFont, accumulateZoom, readFontSize } from "./font-zoom.js";

const el = (id) => document.getElementById(id);
const dom = {
  layout: el("layout"),
  filesToggle: el("files-toggle"),
  run: el("run"),
  stop: el("stop"),
  examples: el("examples"),
  share: el("share"),
  exportBtn: el("export"),
  importBtn: el("import"),
  file: el("file"),
  theme: el("theme"),
  fontIn: el("font-in"),
  fontOut: el("font-out"),
  fontPx: el("font-px"),
  editor: el("editor"),
  problems: el("problems"),
  programList: el("program-list"),
  datasetList: el("dataset-list"),
  newProgram: el("new-program"),
  filesClose: el("files-close"),
  input: el("input"),
  output: el("output"),
  status: el("status"),
  retryRuntime: el("retry-runtime"),
  clearOutput: el("clear-output"),
  progress: el("progress"),
  progressBar: el("progress-bar"),
  reference: el("reference"),
  modal: el("modal"),
  modalTitle: el("modal-title"),
  modalText: el("modal-text"),
  modalPre: el("modal-pre"),
  modalInput: el("modal-input"),
  modalOk: el("modal-ok"),
  modalCancel: el("modal-cancel"),
};

const STORE_KEYS = {
  theme: "javasandbox.theme",
  fontSize: "javasandbox.fontSize",
  active: "javasandbox.active",
  sidebar: "javasandbox.sidebar",
};

const FONT = { min: 10, max: 26, fallback: 14 };
const OUTPUT_LIMIT = 300000;
const STARTER_CODE = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
`;
const STARTER_INPUT = "";

const state = {
  programs: [],
  activeId: null,
  active: null,
  model: null,
  editor: null,
  worker: null,
  running: false,
  runtimeReady: false,
  runtimeFailed: false,
  currentRun: null,
  compileProblems: [],
  hints: [],
  outputRaw: "",
  outputTruncated: false,
  outputRenderTimer: null,
  saveTimer: null,
  hintTimer: null,
  suppressChange: false,
  storageOk: true,
  fontSize: loadFontSize(),
  modalResolve: null,
  modalHasInput: false,
};

/* ------------------------------------------------------------------ theme */

function detectTheme() {
  const stored = localStorage.getItem(STORE_KEYS.theme);
  if (stored === "dark" || stored === "light") return stored;
  const attr = document.documentElement.getAttribute("data-user-color-scheme");
  if (attr === "dark" || attr === "light") return attr;
  try {
    const fluid = JSON.parse(localStorage.getItem("Fluid_Color_Scheme") || "null");
    if (fluid) {
      const scheme = fluid["color-scheme"] || fluid.scheme || "";
      if (String(scheme).indexOf("dark") >= 0) return "dark";
      if (String(scheme).indexOf("light") >= 0) return "light";
    }
  } catch { /* the site's storage key may not exist yet */ }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function defineThemes() {
  monaco.editor.defineTheme("pc-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "b4245a", fontStyle: "bold" },
      { token: "type", foreground: "1f6feb" },
      { token: "constant", foreground: "6f42c1" },
      { token: "annotation", foreground: "9a6700" },
      { token: "string", foreground: "0a7d43" },
      { token: "number", foreground: "8a4b00" },
      { token: "comment", foreground: "8b949e", fontStyle: "italic" },
      { token: "operator", foreground: "6f42c1" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#1c1f24",
      "editorLineNumber.foreground": "#b6bcc6",
      "editorGutter.background": "#f6f7f9",
    },
  });
  monaco.editor.defineTheme("pc-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "f27ba7", fontStyle: "bold" },
      { token: "type", foreground: "79b8ff" },
      { token: "constant", foreground: "d2a8ff" },
      { token: "annotation", foreground: "d4a72c" },
      { token: "string", foreground: "6bd693" },
      { token: "number", foreground: "e3b341" },
      { token: "comment", foreground: "7d8590", fontStyle: "italic" },
      { token: "operator", foreground: "d2a8ff" },
    ],
    colors: {
      "editor.background": "#171a1f",
      "editor.foreground": "#e6edf3",
      "editorLineNumber.foreground": "#4d5560",
      "editorGutter.background": "#1d2127",
    },
  });
}

function applyTheme(name) {
  document.documentElement.setAttribute("data-theme", name);
  if (window.monaco) monaco.editor.setTheme(`pc-${name}`);
}

/* --------------------------------------------------------------- font size */

function loadFontSize() {
  try {
    return readFontSize(localStorage.getItem(STORE_KEYS.fontSize), FONT);
  } catch {
    return FONT.fallback;
  }
}

function renderFontPx() {
  dom.fontPx.textContent = `${state.fontSize}px`;
  dom.fontIn.disabled = state.fontSize >= FONT.max;
  dom.fontOut.disabled = state.fontSize <= FONT.min;
}

function setFontSize(px) {
  state.fontSize = clampFont(px, FONT.min, FONT.max);
  try { localStorage.setItem(STORE_KEYS.fontSize, String(state.fontSize)); } catch { /* private browsing */ }
  if (state.editor) state.editor.updateOptions({ fontSize: state.fontSize });
  renderFontPx();
}

/* ----------------------------------------------------------------- programs */

function makeProgram({ name, code, input }) {
  const now = Date.now();
  return {
    id: store.newId(),
    name: uniqueName(name, state.programs.map((program) => program.name)),
    code,
    input,
    createdAt: now,
    updatedAt: now,
  };
}

function sortPrograms(programs) {
  // updatedAt changes on every save, so ordering by it makes the list jump when switching files.
  return [...programs].sort((left, right) => {
    const byCreation = (right.createdAt || 0) - (left.createdAt || 0);
    if (byCreation !== 0) return byCreation;
    return left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
  });
}

async function saveRecord(record) {
  record.updatedAt = Date.now();
  try {
    await store.putProgram(record);
  } catch {
    state.storageOk = false;
    showStorageWarning();
  }
}

function showStorageWarning() {
  if (!state.storageOk) {
    const note = document.querySelector(".files-note");
    if (note) note.textContent = "Browser storage is unavailable. Export your program to keep a copy.";
  }
}

function persistActiveSoon() {
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(() => {
    if (state.active) saveRecord(state.active);
  }, 400);
}

function flushActive() {
  clearTimeout(state.saveTimer);
  state.saveTimer = null;
  if (state.active) saveRecord(state.active);
}

function activeProgramsForNames() {
  return state.programs.filter((program) => program.id !== state.activeId).map((program) => program.name);
}

async function loadPrograms() {
  let records = [];
  try {
    records = await store.listPrograms();
  } catch {
    state.storageOk = false;
    showStorageWarning();
  }

  if (!records.length) {
    const starter = makeProgram({ name: "Hello, Java", code: STARTER_CODE, input: STARTER_INPUT });
    records = [starter];
    await saveRecord(starter);
  }

  state.programs = sortPrograms(records);
  const shared = readShareHash();
  if (shared) {
    const sharedProgram = makeProgram({
      name: shared.name || "Shared program",
      code: typeof shared.code === "string" ? shared.code : STARTER_CODE,
      input: typeof shared.input === "string" ? shared.input : "",
    });
    state.programs = sortPrograms([sharedProgram, ...state.programs]);
    state.activeId = sharedProgram.id;
    await saveRecord(sharedProgram);
    clearShareHash();
    setTimeout(() => toast("Opened the shared program"), 0);
  } else {
    let remembered = null;
    try { remembered = localStorage.getItem(STORE_KEYS.active); } catch { /* private browsing */ }
    state.activeId = state.programs.some((program) => program.id === remembered)
      ? remembered
      : state.programs[0].id;
  }

  state.active = state.programs.find((program) => program.id === state.activeId) || state.programs[0];
  renderProgramList();
  applyActiveToEditor();
}

function renderProgramList() {
  dom.programList.textContent = "";
  const ordered = sortPrograms(state.programs);
  for (const program of ordered) {
    const item = document.createElement("div");
    item.className = `program-item${program.id === state.activeId ? " active" : ""}`;
    item.dataset.id = program.id;
    item.title = program.name;

    const name = document.createElement("button");
    name.className = "program-name";
    name.type = "button";
    name.textContent = program.name;
    name.addEventListener("click", () => selectProgram(program.id));
    item.append(name);

    const actions = document.createElement("div");
    actions.className = "program-actions";
    actions.append(
      iconButton("rename", "Rename program", () => renameProgram(program.id)),
      iconButton("duplicate", "Duplicate program", () => duplicateProgram(program.id)),
      iconButton("delete", "Delete program", () => deleteProgram(program.id)),
    );
    item.append(actions);
    dom.programList.append(item);
  }
}

const ICONS = {
  rename: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 11.5V14h2.5l7-7L9 4.5l-7 7zM13 3.5l-1-1a1 1 0 0 0-1.4 0l-1 1L12 6l1-1a1 1 0 0 0 0-1.5z"/></svg>',
  duplicate: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="2.5" width="7" height="7" rx="1"/><rect x="6.5" y="6.5" width="7" height="7" rx="1"/></svg>',
  delete: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4h10M6 4V3h4v1M5 5l.5 8h5L11 5"/></svg>',
  file: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2.5h6l4 4v7H3z"/><path d="M9 2.5v4h4"/></svg>',
};

function iconButton(icon, label, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "icon-button";
  button.title = label;
  button.setAttribute("aria-label", label);
  button.innerHTML = ICONS[icon];
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    onClick();
  });
  return button;
}

function applyActiveToEditor() {
  if (!state.active || !state.model) return;
  state.suppressChange = true;
  state.model.setValue(state.active.code || "");
  dom.input.value = state.active.input || "";
  state.suppressChange = false;
  state.compileProblems = [];
  state.hints = findPitfalls(state.active.code || "");
  state.outputRaw = "";
  state.outputTruncated = false;
  renderOutput();
  renderProblems();
  setMarkers();
  state.editor.setScrollPosition({ scrollTop: 0 });
  try { localStorage.setItem(STORE_KEYS.active, state.active.id); } catch { /* private browsing */ }
  if (state.editor) state.editor.focus();
}

function selectProgram(id) {
  if (id === state.activeId) return;
  if (state.running) stopProgram();
  flushActive();
  const next = state.programs.find((program) => program.id === id);
  if (!next) return;
  state.activeId = id;
  state.active = next;
  applyActiveToEditor();
  renderProgramList();
  if (window.matchMedia("(max-width: 900px)").matches) {
    dom.layout.classList.remove("sidebar-open");
  }
}

async function newProgram() {
  const name = await openModal({ title: "New program", input: "Untitled", ok: "Create" });
  if (name === null) return;
  const program = makeProgram({ name: name || "Untitled", code: STARTER_CODE, input: STARTER_INPUT });
  state.programs.unshift(program);
  state.activeId = program.id;
  state.active = program;
  await saveRecord(program);
  renderProgramList();
  applyActiveToEditor();
}

async function renameProgram(id) {
  const program = state.programs.find((item) => item.id === id);
  if (!program) return;
  const name = await openModal({ title: "Rename program", input: program.name, ok: "Rename" });
  if (name === null) return;
  const trimmed = name.trim();
  if (!trimmed) return;
  program.name = uniqueName(trimmed, activeProgramsForNames());
  await saveRecord(program);
  renderProgramList();
  if (program.id === state.activeId) document.title = `${program.name} · Java Sandbox`;
}

async function deleteProgram(id) {
  const program = state.programs.find((item) => item.id === id);
  if (!program) return;
  const confirmed = await openModal({
    title: "Delete program",
    text: `Delete “${program.name}”? This cannot be undone.`,
    ok: "Delete",
    danger: true,
  });
  if (!confirmed) return;
  try { await store.deleteProgram(id); } catch { state.storageOk = false; showStorageWarning(); }
  state.programs = state.programs.filter((item) => item.id !== id);
  if (!state.programs.length) {
    const starter = makeProgram({ name: "Hello, Java", code: STARTER_CODE, input: STARTER_INPUT });
    state.programs = [starter];
    await saveRecord(starter);
    state.activeId = starter.id;
    state.active = starter;
  } else if (state.activeId === id) {
    const next = sortPrograms(state.programs)[0];
    state.activeId = next.id;
    state.active = next;
  }
  renderProgramList();
  applyActiveToEditor();
}

async function duplicateProgram(id) {
  const program = state.programs.find((item) => item.id === id);
  if (!program) return;
  const copy = makeProgram({ name: `${program.name} copy`, code: program.code, input: program.input });
  state.programs.unshift(copy);
  state.activeId = copy.id;
  state.active = copy;
  await saveRecord(copy);
  renderProgramList();
  applyActiveToEditor();
  toast("Program duplicated");
}

function onEditorChange() {
  if (state.suppressChange || !state.active) return;
  state.active.code = state.model.getValue();
  state.active.updatedAt = Date.now();
  state.compileProblems = [];
  persistActiveSoon();
  clearTimeout(state.hintTimer);
  state.hintTimer = setTimeout(() => {
    if (!state.active) return;
    state.hints = findPitfalls(state.active.code || "");
    renderProblems();
    setMarkers();
  }, 300);
}

/* ------------------------------------------------------------------ worker */

const workerUrl = new URL("./runner-worker.js?v=3", import.meta.url);
const toolsJarUrl = new URL("/tools-8u504-r2.jar", location.origin).href;

function warmRuntime(label = "Loading Java runtime…") {
  if (state.worker) state.worker.terminate();
  state.worker = null;
  state.runtimeReady = false;
  state.runtimeFailed = false;
  state.running = false;
  setStatus(label, "loading");
  dom.retryRuntime.hidden = true;
  setRunUI();
  hideProgress();

  const worker = new Worker(workerUrl);
  state.worker = worker;
  worker.onmessage = handleWorkerMessage;
  worker.onerror = (event) => {
    state.runtimeReady = false;
    state.runtimeFailed = true;
    state.running = false;
    setRunUI();
    setStatus("Java runtime unavailable", "error");
    showRuntimeError(event.message || "The Java worker stopped unexpectedly.");
  };
  worker.postMessage({ type: "warmup", runnerSource: RUNNER_SOURCE, toolsJarUrl });
}

function handleWorkerMessage(event) {
  const message = event.data || {};
  switch (message.type) {
    case "status":
      if (message.phase === "runtime") setStatus("Starting Java runtime…", "loading");
      else if (message.phase === "compiler") setStatus("Loading Java compiler…", "loading");
      else if (message.phase === "compiling") setStatus("Compiling…", "busy");
      else if (message.phase === "running") setStatus("Running…", "busy");
      break;
    case "progress": {
      const total = Number(message.total) || 0;
      const loaded = Number(message.loaded) || 0;
      const percent = total ? Math.min(100, Math.round((loaded / total) * 100)) : null;
      setStatus(percent === null ? "Loading Java compiler…" : `Loading Java compiler… ${percent}%`, "loading");
      showProgress(loaded, total);
      break;
    }
    case "ready":
      state.runtimeReady = true;
      state.runtimeFailed = false;
      hideProgress();
      dom.retryRuntime.hidden = true;
      setStatus("Ready · Java 8", "ready");
      setRunUI();
      break;
    case "init-error":
      state.runtimeReady = false;
      state.runtimeFailed = true;
      state.running = false;
      setRunUI();
      setStatus("Java runtime unavailable", "error");
      showRuntimeError(message.message || "Could not start the Java runtime.");
      break;
    case "compile":
      handleCompile(message);
      break;
    case "stdout":
    case "stderr":
      appendOutput(message.text || "");
      break;
    case "run-done":
      handleRunDone(Number(message.code) || 0);
      break;
    case "error":
      state.running = false;
      setRunUI();
      setStatus("Java runtime error", "error");
      appendNote(`\n[sandbox error] ${message.message || "The runtime reported an error."}\n`);
      break;
    default:
      break;
  }
}

function handleCompile(message) {
  state.compileProblems = parseCompileOutput(message.text || "", state.currentRun ? state.currentRun.sourceFileName : "Main.java");
  if (Number(message.code) !== 0) {
    state.running = false;
    setRunUI();
    setStatus("Compile failed", "error");
    renderProblems();
    setMarkers();
    appendNote("\nCompilation failed — see the problems below the editor.\n");
    return;
  }
  renderProblems();
  setMarkers();
  setStatus("Running…", "busy");
}

function handleRunDone(code) {
  state.running = false;
  setRunUI();
  const runtimeError = parseRuntimeError(state.outputRaw);
  if (runtimeError) {
    state.compileProblems = [runtimeError, ...state.compileProblems.filter((problem) => problem.severity !== "error")];
    renderProblems();
    setMarkers();
    appendNote("\nRuntime error — see the problems below the editor.\n");
    setStatus("Runtime error", "error");
  } else {
    const sandboxMessage = /\[sandbox\]\s+(.+)/.exec(state.outputRaw);
    if (sandboxMessage) {
      const text = sandboxMessage[1].trim();
      state.compileProblems = [{
        severity: "error",
        line: null,
        file: null,
        en: text,
        zh: /main/i.test(text) ? "缺少 public static void main(String[] args) 入口方法。" : "沙箱无法运行这个程序：检查类名和方法签名。",
        original: text,
        detail: "",
      }, ...state.compileProblems];
      renderProblems();
      setMarkers();
    }
    setStatus(code === 0 ? "Finished" : `Exited with code ${code}`, code === 0 ? "ready" : "error");
  }
  state.currentRun = null;
}

function runProgram() {
  if (state.running) return;
  if (!state.runtimeReady) {
    toast(state.runtimeFailed ? "Java runtime is unavailable. Try Retry." : "Java runtime is still loading…");
    return;
  }
  if (!state.active) return;
  flushActive();
  const code = state.active.code || "";
  const sourceFileName = sourceFileNameFor(code);
  const mainClass = detectMainClassName(code) || sourceFileName.replace(/\.java$/, "");
  state.currentRun = { sourceFileName, mainClass };
  state.compileProblems = [];
  state.outputRaw = "";
  state.outputTruncated = false;
  state.running = true;
  setRunUI();
  setStatus("Compiling…", "busy");
  renderOutput();
  renderProblems();
  clearMarkers();
  if (!hasMainMethod(code)) {
    state.compileProblems = [{
      severity: "warning",
      line: null,
      file: null,
      en: "No public static void main(String[] args) method was found.",
      zh: "找不到入口方法：程序需要一个 public static void main(String[] args)。",
      original: "",
      detail: "",
    }];
    renderProblems();
    setMarkers();
  }
  state.worker.postMessage({
    type: "run",
    code,
    input: dom.input.value,
    datasets: DATASETS,
    sourceFileName,
    mainClass,
  });
}

function stopProgram() {
  if (!state.running) return;
  if (state.worker) {
    state.worker.terminate();
    state.worker = null;
  }
  state.running = false;
  setRunUI();
  appendNote("\n[stopped]\n");
  setStatus("Stopped", "idle");
  warmRuntime("Stopped — restarting Java runtime…");
}

function showRuntimeError(message) {
  dom.retryRuntime.hidden = false;
  appendNote(`\nCould not start the Java runtime.\n${message}\n\n`);
}

/* ------------------------------------------------------------------ output */

function appendOutput(text) {
  if (!text) return;
  state.outputRaw += text;
  if (state.outputRaw.length > OUTPUT_LIMIT) {
    state.outputRaw = state.outputRaw.slice(-OUTPUT_LIMIT);
    state.outputTruncated = true;
  }
  scheduleOutputRender();
}

function appendNote(text) {
  appendOutput(text);
}

function scheduleOutputRender() {
  if (state.outputRenderTimer) return;
  state.outputRenderTimer = setTimeout(() => {
    state.outputRenderTimer = null;
    renderOutput();
  }, 30);
}

function normalizeOutput(text) {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

function renderOutput() {
  const nearBottom = dom.output.scrollTop + dom.output.clientHeight >= dom.output.scrollHeight - 24;
  if (!state.outputRaw) {
    dom.output.textContent = "";
    const placeholder = document.createElement("span");
    placeholder.className = "placeholder";
    placeholder.textContent = "Run your program to see its output. Ctrl/Cmd + Enter.";
    dom.output.append(placeholder);
    return;
  }
  const prefix = state.outputTruncated ? "[earlier output truncated]\n\n" : "";
  dom.output.textContent = prefix + normalizeOutput(state.outputRaw);
  if (nearBottom) dom.output.scrollTop = dom.output.scrollHeight;
}

/* ---------------------------------------------------------------- problems */

function renderProblems() {
  const problems = [...state.compileProblems, ...state.hints];
  dom.problems.textContent = "";
  if (!problems.length) {
    dom.problems.classList.remove("has-problems");
    return;
  }
  dom.problems.classList.add("has-problems");
  const seen = new Set();
  for (const problem of problems) {
    const key = `${problem.severity}:${problem.line}:${problem.en}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const row = document.createElement("div");
    row.className = `prob ${problem.severity}`;

    const tag = document.createElement("span");
    tag.className = "prob-tag";
    tag.textContent = problem.severity === "error" ? "ERROR" : problem.severity === "warning" ? "WARN" : "TIP";

    const location = document.createElement(problem.line ? "button" : "span");
    location.className = "prob-where";
    if (problem.line) {
      location.type = "button";
      location.textContent = problem.file && problem.file !== "__JavaRunner.java"
        ? `${problem.file}:${problem.line}`
        : `line ${problem.line}`;
      location.addEventListener("click", () => revealLine(problem.line));
    } else {
      location.textContent = problem.runtime ? "runtime" : "sandbox";
    }

    const body = document.createElement("div");
    body.className = "prob-body";
    const en = document.createElement("div");
    en.className = "prob-en";
    en.textContent = problem.en;
    const zh = document.createElement("div");
    zh.className = "prob-zh";
    zh.textContent = problem.zh;
    body.append(en, zh);

    row.append(tag, location, body);
    if (problem.detail) {
      const details = document.createElement("details");
      details.className = "prob-details";
      const summary = document.createElement("summary");
      summary.textContent = "Details";
      const pre = document.createElement("pre");
      pre.textContent = problem.detail;
      details.append(summary, pre);
      row.append(details);
    }
    dom.problems.append(row);
  }
}

function setMarkers() {
  if (!state.model || !window.monaco) return;
  const markers = [...state.compileProblems, ...state.hints]
    .filter((problem) => problem.line)
    .map((problem) => ({
      severity: problem.severity === "error"
        ? monaco.MarkerSeverity.Error
        : problem.severity === "warning" ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Hint,
      startLineNumber: problem.line,
      startColumn: 1,
      endLineNumber: problem.line,
      endColumn: 90,
      message: `${problem.en} ${problem.zh}`,
    }));
  monaco.editor.setModelMarkers(state.model, "java8", markers);
}

function clearMarkers() {
  if (state.model && window.monaco) monaco.editor.setModelMarkers(state.model, "java8", []);
}

function revealLine(line) {
  if (!state.editor || !line) return;
  state.editor.revealLineInCenterIfOutsideViewport(line);
  state.editor.setPosition({ lineNumber: line, column: 1 });
  state.editor.focus();
}

/* --------------------------------------------------------------- UI helpers */

function setStatus(text, kind = "") {
  dom.status.textContent = text;
  dom.status.className = `status ${kind}`.trim();
}

function setRunUI() {
  dom.run.disabled = state.running || !state.runtimeReady;
  dom.stop.disabled = !state.running;
  dom.run.title = state.runtimeReady ? "Run (Ctrl/Cmd + Enter)" : "Waiting for the Java runtime";
}

function showProgress(loaded, total) {
  dom.progress.hidden = false;
  const percent = total ? Math.min(100, (loaded / total) * 100) : 4;
  dom.progressBar.style.width = `${Math.max(2, percent)}%`;
}

function hideProgress() {
  dom.progress.hidden = true;
  dom.progressBar.style.width = "0%";
}

function toast(message) {
  let node = document.querySelector(".toast");
  if (!node) {
    node = document.createElement("div");
    node.className = "toast";
    document.body.append(node);
  }
  node.textContent = message;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.remove(), 2600);
}

function openModal({ title, text = "", input = null, pre = null, ok = "OK", cancel = "Cancel", danger = false, single = false }) {
  return new Promise((resolve) => {
    state.modalResolve = resolve;
    state.modalHasInput = input !== null && input !== undefined;
    dom.modalTitle.textContent = title || "";
    dom.modalText.textContent = text;
    dom.modalText.hidden = !text;
    dom.modalPre.textContent = pre || "";
    dom.modalPre.hidden = pre === null || pre === undefined;
    dom.modalInput.hidden = !state.modalHasInput;
    dom.modalInput.value = state.modalHasInput ? input : "";
    dom.modalOk.textContent = ok;
    dom.modalOk.classList.toggle("danger", danger);
    dom.modalCancel.hidden = single;
    dom.modalCancel.textContent = cancel;
    dom.modal.hidden = false;
    setTimeout(() => {
      if (state.modalHasInput) {
        dom.modalInput.focus();
        dom.modalInput.select();
      } else {
        dom.modalOk.focus();
      }
    }, 0);
  });
}

function closeModal(value) {
  dom.modal.hidden = true;
  const resolve = state.modalResolve;
  state.modalResolve = null;
  if (resolve) resolve(value);
}

/* ------------------------------------------------------------------- share */

function readShareHash() {
  const match = /^#p=(.+)$/.exec(location.hash || "");
  if (!match) return null;
  try {
    const payload = decodeState(match[1]);
    if (!payload || typeof payload !== "object") return null;
    return payload;
  } catch {
    return null;
  }
}

function clearShareHash() {
  if (!location.hash) return;
  history.replaceState(null, "", `${location.pathname}${location.search}`);
}

function shareProgram() {
  if (!state.active) return;
  const payload = {
    v: 1,
    n: state.active.name,
    c: state.active.code,
    i: dom.input.value,
  };
  const url = `${location.origin}${location.pathname}#p=${encodeState(payload)}`;
  navigator.clipboard.writeText(url)
    .then(() => toast("Link copied — it opens with this program"))
    .catch(() => {
      location.hash = `p=${encodeState(payload)}`;
      toast("Link added to the address bar");
    });
}

/* ------------------------------------------------------------------- files */

function exportProgram() {
  if (!state.active) return;
  const blob = new Blob([state.active.code], { type: "text/plain;charset=utf-8" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `${sanitizeFileName(state.active.name)}.java`;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

async function importFile(file) {
  if (!file) return;
  if (file.size > 1024 * 1024) {
    toast("That file is too large (limit 1 MB)");
    return;
  }
  const text = await file.text();
  const name = file.name.replace(/\.java$/i, "") || "Imported program";
  const program = makeProgram({ name, code: text, input: "" });
  state.programs.unshift(program);
  state.activeId = program.id;
  state.active = program;
  await saveRecord(program);
  renderProgramList();
  applyActiveToEditor();
  toast(`Imported ${file.name}`);
}

/* ------------------------------------------------------------------ content */

function fillExamples() {
  dom.examples.textContent = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Examples…";
  dom.examples.append(placeholder);
  const groups = new Map();
  for (const example of EXAMPLES) {
    if (!groups.has(example.group)) {
      const group = document.createElement("optgroup");
      group.label = example.group;
      groups.set(example.group, group);
      dom.examples.append(group);
    }
    const option = document.createElement("option");
    option.value = example.name;
    option.textContent = example.name;
    option.title = example.blurb;
    groups.get(example.group).append(option);
  }
}

function renderDatasets() {
  dom.datasetList.textContent = "";
  for (const dataset of DATASETS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "dataset-item";
    button.title = dataset.note;
    const icon = document.createElement("span");
    icon.className = "dataset-icon";
    icon.innerHTML = ICONS.file;
    const name = document.createElement("span");
    name.textContent = dataset.name;
    button.append(icon, name);
    button.addEventListener("click", () => {
      openModal({
        title: dataset.name,
        text: `${dataset.note} Read it with new Scanner(new File("${dataset.name}")).`,
        pre: dataset.content,
        ok: "Close",
        single: true,
      });
    });
    dom.datasetList.append(button);
  }
}

async function loadExample(name) {
  const example = EXAMPLES.find((item) => item.name === name);
  if (!example) return;
  const program = makeProgram({
    name: example.name,
    code: example.code,
    input: (example.inputs || []).join("\n"),
  });
  state.programs.unshift(program);
  state.activeId = program.id;
  state.active = program;
  await saveRecord(program);
  renderProgramList();
  applyActiveToEditor();
  dom.examples.value = "";
  toast("Example added as a new program");
}

/* -------------------------------------------------------------------- wiring */

function wireTabs() {
  document.querySelectorAll(".tabs .tab").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tabs .tab").forEach((other) => other.classList.toggle("active", other === button));
      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.toggle("active", panel.id === `tab-${button.dataset.tab}`);
      });
    });
  });
}

function wireDivider() {
  const work = el("work");
  let dragging = false;
  el("divider").addEventListener("mousedown", () => {
    dragging = true;
    document.body.style.userSelect = "none";
  });
  window.addEventListener("mouseup", () => {
    dragging = false;
    document.body.style.userSelect = "";
  });
  window.addEventListener("mousemove", (event) => {
    if (!dragging) return;
    const bounds = work.getBoundingClientRect();
    const left = Math.min(Math.max(event.clientX - bounds.left, 320), bounds.width - 320);
    work.style.gridTemplateColumns = `${left}px 6px minmax(280px, 1fr)`;
  });
}

function initSidebar() {
  const mobile = window.matchMedia("(max-width: 900px)");
  let stored = null;
  try { stored = localStorage.getItem(STORE_KEYS.sidebar); } catch { /* private browsing */ }
  if (mobile.matches) {
    dom.layout.classList.remove("sidebar-hidden");
    dom.layout.classList.remove("sidebar-open");
  } else if (stored === "hidden") {
    dom.layout.classList.add("sidebar-hidden");
  }
  dom.filesToggle.addEventListener("click", () => {
    if (mobile.matches) {
      dom.layout.classList.toggle("sidebar-open");
    } else {
      dom.layout.classList.toggle("sidebar-hidden");
      try {
        localStorage.setItem(STORE_KEYS.sidebar, dom.layout.classList.contains("sidebar-hidden") ? "hidden" : "shown");
      } catch { /* private browsing */ }
    }
  });
  mobile.addEventListener("change", () => {
    dom.layout.classList.remove("sidebar-open");
  });
}

function wireUI() {
  dom.run.addEventListener("click", runProgram);
  dom.stop.addEventListener("click", stopProgram);
  dom.newProgram.addEventListener("click", newProgram);
  dom.filesClose.addEventListener("click", () => dom.layout.classList.remove("sidebar-open"));
  dom.share.addEventListener("click", shareProgram);
  dom.exportBtn.addEventListener("click", exportProgram);
  dom.importBtn.addEventListener("click", () => dom.file.click());
  dom.file.addEventListener("change", () => {
    if (dom.file.files[0]) importFile(dom.file.files[0]);
    dom.file.value = "";
  });
  dom.clearOutput.addEventListener("click", () => {
    state.outputRaw = "";
    state.outputTruncated = false;
    renderOutput();
  });
  dom.retryRuntime.addEventListener("click", () => warmRuntime());
  dom.input.addEventListener("input", () => {
    if (!state.active) return;
    state.active.input = dom.input.value;
    state.active.updatedAt = Date.now();
    persistActiveSoon();
  });
  dom.examples.addEventListener("change", () => {
    if (dom.examples.value) loadExample(dom.examples.value);
  });
  dom.theme.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    try { localStorage.setItem(STORE_KEYS.theme, next); } catch { /* private browsing */ }
    applyTheme(next);
  });
  dom.fontIn.addEventListener("click", () => setFontSize(state.fontSize + 1));
  dom.fontOut.addEventListener("click", () => setFontSize(state.fontSize - 1));
  dom.modalOk.addEventListener("click", () => closeModal(state.modalHasInput ? dom.modalInput.value.trim() : true));
  dom.modalCancel.addEventListener("click", () => closeModal(null));
  dom.modalInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") closeModal(dom.modalInput.value.trim());
    if (event.key === "Escape") closeModal(null);
  });
  dom.modal.addEventListener("click", (event) => {
    if (event.target === dom.modal && !dom.modalCancel.hidden) closeModal(null);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dom.modal.hidden) closeModal(null);
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && !state.running) runProgram();
  });
  let carry = 0;
  dom.editor.addEventListener("wheel", (event) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    event.stopPropagation();
    const step = accumulateZoom(carry, event);
    carry = step.carry;
    if (step.whole) setFontSize(state.fontSize + step.whole);
  }, { capture: true, passive: false });
  window.addEventListener("beforeunload", () => {
    flushActive();
    if (state.worker) state.worker.terminate();
  });
  wireTabs();
  wireDivider();
  initSidebar();
}

/* -------------------------------------------------------------------- boot */

const monacoVsRoot = new URL("../vendor/monaco/vs", import.meta.url).href.replace(/\/$/, "");
window.MonacoEnvironment = { getWorkerUrl: () => `${monacoVsRoot}/base/worker/workerMain.js` };
window.require.config({ paths: { vs: monacoVsRoot } });
window.require(["vs/editor/editor.main"], boot);

async function boot() {
  defineThemes();
  registerJavaLanguage(monaco);
  applyTheme(detectTheme());

  state.model = monaco.editor.createModel("", "java8");
  state.editor = monaco.editor.create(dom.editor, {
    model: state.model,
    fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
    fontSize: state.fontSize,
    minimap: { enabled: false },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    tabSize: 4,
    insertSpaces: true,
    renderWhitespace: "selection",
    padding: { top: 10 },
    suggest: { showSnippets: true },
  });

  state.model.onDidChangeContent(onEditorChange);
  fillExamples();
  dom.reference.innerHTML = REFERENCE_HTML;
  renderDatasets();
  renderFontPx();
  renderOutput();
  wireUI();

  await loadPrograms();
  warmRuntime();
  setRunUI();
}
