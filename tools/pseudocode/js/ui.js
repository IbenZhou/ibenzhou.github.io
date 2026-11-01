import { analyse, runInteractive, formatDiagnostics } from "./engine.js";
import { examplesFor } from "./examples.js";
import { referenceFor, keywordsFor, builtinListFor } from "./reference.js";
import { BUILTINS } from "./builtins.js";
import { DIALECTS, dialectOf } from "./dialect.js";

const el = (id) => document.getElementById(id);
const dom = {
  editor: el("editor"), examples: el("examples"), run: el("run"), stop: el("stop"), step: el("step"),
  reset: el("reset"), share: el("share"), download: el("download"), open: el("open"), file: el("file"),
  theme: el("theme"), inputs: el("inputs"), output: el("output"), diagnostics: el("diagnostics"),
  trace: el("trace"), traceNote: el("trace-note"), vars: el("vars"), reference: el("reference"),
  divider: el("divider"), prompt: el("prompt"), promptVar: el("prompt-var"), promptValue: el("prompt-value"),
  promptOk: el("prompt-ok"), promptCancel: el("prompt-cancel"),
};

const STORE = { doc: "pseudocode9618.doc", inputs: "pseudocode9618.inputs", theme: "pseudocode9618.theme", syllabus: "pseudocode9618.syllabus" };

const state = {
  dialect: "9618",
  running: false, paused: false, stepMode: false, stopRequested: false,
  resume: null, lastLine: 0, renderedOutputs: 0, renderedTraceRows: -1, breakpoints: new Set(), decorations: [], currentDecorations: [],
};

let editor = null;
let model = null;

/* ------------------------------------------------------------------ theme */

function detectTheme() {
  const stored = localStorage.getItem(STORE.theme);
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

function applyTheme(name) {
  document.documentElement.setAttribute("data-theme", name);
  if (window.monaco) monaco.editor.setTheme(`pc-${name}`);
}

/* ------------------------------------------------------------- monaco setup */

function defineThemes() {
  const base = {
    "editor.background": "#ffffff",
    "editor.foreground": "#1c1f24",
    "editorLineNumber.foreground": "#b6bcc6",
    "editorGutter.background": "#f6f7f9",
  };
  monaco.editor.defineTheme("pc-light", {
    base: "vs", inherit: true, rules: [
      { token: "keyword", foreground: "b4245a", fontStyle: "bold" },
      { token: "builtin", foreground: "1f6feb" },
      { token: "string", foreground: "0a7d43" },
      { token: "string.quote", foreground: "0a7d43" },
      { token: "number", foreground: "8a4b00" },
      { token: "comment", foreground: "8b949e", fontStyle: "italic" },
      { token: "operator", foreground: "6f42c1" },
    ], colors: base,
  });
  monaco.editor.defineTheme("pc-dark", {
    base: "vs-dark", inherit: true, rules: [
      { token: "keyword", foreground: "f27ba7", fontStyle: "bold" },
      { token: "builtin", foreground: "79b8ff" },
      { token: "string", foreground: "6bd693" },
      { token: "string.quote", foreground: "6bd693" },
      { token: "number", foreground: "e3b341" },
      { token: "comment", foreground: "7d8590", fontStyle: "italic" },
      { token: "operator", foreground: "d2a8ff" },
    ], colors: { "editor.background": "#171a1f", "editor.foreground": "#e6edf3", "editorLineNumber.foreground": "#4d5560", "editorGutter.background": "#1d2127" },
  });
}

function registerLanguage() {
  monaco.languages.register({ id: "pseudocode" });

  monaco.languages.setLanguageConfiguration("pseudocode", {
    comments: { lineComment: "//" },
    brackets: [["(", ")"], ["[", "]"]],
    autoClosingPairs: [
      { open: "(", close: ")" }, { open: "[", close: "]" },
      { open: '"', close: '"' }, { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: "(", close: ")" }, { open: "[", close: "]" },
      { open: '"', close: '"' }, { open: "'", close: "'" },
    ],
    onEnterRules: [
      {
        beforeText: /^\s*(IF|ELSE|CASE|FOR|WHILE|REPEAT|PROCEDURE|FUNCTION|TYPE)\b.*$/i,
        action: { indentAction: monaco.languages.IndentAction.Indent },
      },
    ],
  });

  monaco.languages.setMonarchTokensProvider("pseudocode", monarchFor(state.dialect));
}

function monarchFor(d) {
  return {
    keywords: keywordsFor(d.id),
    builtins: builtinListFor(d.id),
    tokenizer: {
      root: [
        [/\/\/.*/, "comment"],
        [/[A-Za-z][A-Za-z0-9_]*/, {
          cases: {
            "@keywords": "keyword",
            "@builtins": "builtin",
            "@default": "identifier",
          },
        }],
        [/"(?:[^"\\]|\\.)*"/, "string"],
        [/'(?:[^'\\]|\\.)*'/, "string.quote"],
        [/[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}/, "number.date"],
        [/[0-9]*\.[0-9]+|[0-9]+/, "number"],
        [/(<=|>=|<>|<-|←|=|<|>)/, "operator"],
        [/[+\-*/&]/, "operator"],
        [/[(),\[\]:]/, "delimiter"],
        [/[^\s]+/, "invalid"],
      ],
    },
  };
}

function registerCompletion() {
  monaco.languages.registerCompletionItemProvider("pseudocode", {
    provideCompletionItems(editorModel, position) {
      const word = editorModel.getWordUntilPosition(position);
      const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
      const text = editorModel.getValue();
      const suggestions = [];

      for (const keyword of keywordsFor(state.dialect)) {
        suggestions.push({ label: keyword, kind: monaco.languages.CompletionItemKind.Keyword, insertText: keyword, range, detail: "keyword" });
      }
      for (const name of builtinListFor(state.dialect)) {
        const fn = BUILTINS[name];
        suggestions.push({
          label: name, kind: monaco.languages.CompletionItemKind.Function,
          insertText: name + "($0)", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range, detail: fn.signature, documentation: fn.doc,
        });
      }
      for (const declared of declaredNames(text)) {
        suggestions.push({ label: declared.name, kind: monaco.languages.CompletionItemKind.Variable, insertText: declared.name, range, detail: declared.type });
      }
      for (const routine of routineNames(text)) {
        suggestions.push({ label: routine.name, kind: monaco.languages.CompletionItemKind.Method, insertText: routine.name, range, detail: routine.kind });
      }
      return { suggestions };
    },
  });

  monaco.languages.registerSignatureHelpProvider("pseudocode", {
    signatureHelpTriggerCharacters: ["(", ","],
    provideSignatureHelp(editorModel, position) {
      const before = editorModel.getValueInRange({
        startLineNumber: position.lineNumber, startColumn: 1,
        endLineNumber: position.lineNumber, endColumn: position.column,
      });
      const match = /([A-Za-z][A-Za-z0-9_]*)\s*\(([^()]*)$/.exec(before);
      if (!match) return null;
      const name = match[1].toUpperCase();
      const fn = BUILTINS[name];
      if (!fn) return null;
      return {
        value: {
          signatures: [{ label: fn.signature, parameters: fn.args(state.dialect).map((types) => ({ label: types.join("|") })) }],
          activeSignature: 0,
          activeParameter: Math.min(match[2].split(",").length - 1, Math.max(0, fn.args(state.dialect).length - 1)),
        },
        dispose() {},
      };
    },
  });
}

function declaredNames(text) {
  const found = [];
  const seen = new Set();
  const pattern = /DECLARE\s+([A-Za-z][A-Za-z0-9_,\s]*?)\s*:\s*(ARRAY\[[^\]]*\]\s*OF\s*[A-Z]+|[A-Z]+)/gi;
  let match;
  while ((match = pattern.exec(text))) {
    const type = match[2].toUpperCase().replace(/\s+/g, " ");
    for (const name of match[1].split(",")) {
      const trimmed = name.trim();
      const key = trimmed.toUpperCase();
      if (trimmed && !seen.has(key)) { seen.add(key); found.push({ name: trimmed, type }); }
    }
  }
  const paramPattern = /(?:PROCEDURE|FUNCTION)\s+([A-Za-z][A-Za-z0-9_]*)\s*\(([^)]*)\)/gi;
  while ((match = paramPattern.exec(text))) {
    for (const part of match[2].split(",")) {
      const name = part.replace(/BYREF|BYVAL/gi, "").trim().split(/[\s:]/)[0];
      const key = name.toUpperCase();
      if (name && !seen.has(key)) { seen.add(key); found.push({ name, type: "parameter" }); }
    }
  }
  return found;
}

function routineNames(text) {
  const out = [];
  const pattern = /(PROCEDURE|FUNCTION)\s+([A-Za-z][A-Za-z0-9_]*)/gi;
  let match;
  while ((match = pattern.exec(text))) out.push({ name: match[2], kind: match[1].toUpperCase() });
  return out;
}

/* ------------------------------------------------------------- diagnostics */

function renderDiagnostics(list) {
  dom.diagnostics.textContent = "";
  for (const item of list) {
    const row = document.createElement("div");
    row.className = `diag ${item.level}`;
    const where = document.createElement("span");
    where.className = "where";
    where.textContent = `L${item.line}`;
    const en = document.createElement("span");
    en.className = "en";
    en.textContent = item.en;
    const zh = document.createElement("span");
    zh.className = "zh";
    zh.textContent = item.zh;
    const code = document.createElement("span");
    code.className = "code";
    code.textContent = item.code;
    row.append(where, en, zh, code);
    row.addEventListener("click", () => revealLine(item.line));
    if (item.fix && item.fix.type === "insert_declare") row.appendChild(fixButton(item));
    dom.diagnostics.appendChild(row);
  }
}

function fixButton(item) {
  const button = document.createElement("button");
  button.className = "fix";
  button.textContent = `insert DECLARE ${item.fix.name} : ${item.fix.suggested || "INTEGER"}`;
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    insertDeclaration(item.fix.name, item.fix.suggested || "INTEGER", item.line);
  });
  return button;
}

function insertDeclaration(name, type, useLine) {
  const lines = model.getValue().split("\n");
  let insertAt = 0;
  for (let i = useLine - 2; i >= 0; i--) {
    const trimmed = (lines[i] || "").trim();
    if (/^(PROCEDURE|FUNCTION)\b/i.test(trimmed)) { insertAt = i + 1; break; }
    if (/^(CONSTANT|DECLARE)\b/i.test(trimmed)) continue;
    if (trimmed === "") continue;
    insertAt = i + 1;
    break;
  }
  const indent = /^(\s*)/.exec(lines[useLine - 1] || "")[1] || "";
  const header = insertAt === 0 ? "" : indent;
  const statement = `${header}DECLARE ${name} : ${type}`;
  lines.splice(insertAt, 0, statement);
  model.setValue(lines.join("\n"));
  revealLine(insertAt + 1);
  refresh();
}

function revealLine(line) {
  if (!editor || !line) return;
  editor.revealLineInCenterIfOutsideViewport(line);
  editor.setPosition({ lineNumber: line, column: 1 });
  editor.focus();
}

function refresh() {
  const text = model.getValue();
  const analysed = analyse(text, { dialect: state.dialect });
  const formatted = formatDiagnostics(analysed.diagnostics);
  monaco.editor.setModelMarkers(model, "pseudocode", formatted.map((d) => ({
    severity: d.level === "error" ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
    startLineNumber: d.line, startColumn: d.col,
    endLineNumber: d.line, endColumn: d.col + 30,
    message: `${d.en}  ${d.zh}`,
  })));
  renderDiagnostics(formatted);
  return analysed;
}

/* ------------------------------------------------------------------ render */

function renderOutput(result) {
  dom.output.textContent = "";
  if (!result.output && !result.errors.length && !result.notes.length) {
    const span = document.createElement("span");
    span.className = "placeholder";
    span.textContent = "(no output)";
    dom.output.appendChild(span);
    return;
  }
  dom.output.append(result.output);
  for (const error of result.errors) {
    const line = document.createElement("span");
    line.className = "run-error";
    line.textContent = `Line ${error.line}: ${error.en}  ${error.zh}\n`;
    dom.output.appendChild(line);
  }
}

function renderTrace(trace) {
  dom.trace.textContent = "";
  dom.traceNote.textContent = trace.overflow ? `Showing the first ${trace.rows.length} rows; ${trace.overflow} more were skipped.` : "";
  if (!trace.rows.length) {
    dom.traceNote.textContent = dom.traceNote.textContent || "No trace rows yet. Run the program, or step through it.";
    return;
  }
  const head = document.createElement("tr");
  for (const col of trace.cols) {
    const th = document.createElement("th");
    th.textContent = col;
    head.appendChild(th);
  }
  const outHead = document.createElement("th");
  outHead.textContent = "Output";
  head.appendChild(outHead);
  dom.trace.appendChild(head);

  for (const row of trace.rows) {
    const tr = document.createElement("tr");
    tr.dataset.line = row.line;
    for (const col of trace.cols) {
      const td = document.createElement("td");
      td.className = "num";
      td.textContent = row.cells[col] === undefined ? "" : row.cells[col];
      tr.appendChild(td);
    }
    const outCell = document.createElement("td");
    outCell.className = "out-cell";
    outCell.textContent = row.out;
    tr.appendChild(outCell);
    tr.addEventListener("click", () => revealLine(Number(tr.dataset.line)));
    dom.trace.appendChild(tr);
  }
}

function renderVariables(rows) {
  dom.vars.textContent = "";
  if (!rows.length) return;
  const head = document.createElement("tr");
  for (const label of ["Name", "Type", "Value"]) {
    const th = document.createElement("th");
    th.textContent = label;
    head.appendChild(th);
  }
  dom.vars.appendChild(head);
  for (const row of rows) {
    const tr = document.createElement("tr");
    const name = document.createElement("td");
    name.textContent = row.scope ? `${row.scope}.${row.name}` : row.name;
    const type = document.createElement("td");
    type.textContent = row.type;
    const value = document.createElement("td");
    value.className = "num";
    value.textContent = row.value;
    tr.append(name, type, value);
    dom.vars.appendChild(tr);
  }
}

function renderReference() {
  dom.reference.textContent = "";
  for (const section of referenceFor(state.dialect)) {
    const heading = document.createElement("h3");
    heading.textContent = section.group;
    dom.reference.appendChild(heading);
    for (const item of section.items) {
      const row = document.createElement("div");
      row.className = "ref-item";
      const code = document.createElement("code");
      code.textContent = item.syntax;
      const desc = document.createElement("span");
      desc.className = "desc";
      desc.textContent = `${item.note} ${item.zh}`;
      row.append(code, desc);
      if (item.skeleton) {
        const button = document.createElement("button");
        button.textContent = "insert";
        button.addEventListener("click", () => insertSkeleton(item.skeleton));
        row.appendChild(button);
      }
      dom.reference.appendChild(row);
    }
  }
}

function insertSkeleton(skeleton) {
  const position = editor.getPosition();
  editor.executeEdits("reference", [{
    range: new monaco.Range(position.lineNumber, 1, position.lineNumber, 1),
    text: skeleton,
  }]);
  editor.focus();
}

/* -------------------------------------------------------------------- run */

function parseInputs() {
  const raw = dom.inputs.value;
  if (!raw.trim()) return [];
  return raw.replace(/\r/g, "").split("\n");
}

function setRunning(running) {
  state.running = running;
  dom.run.disabled = running;
  dom.stop.disabled = !running;
  dom.step.disabled = running && !state.paused;
  dom.examples.disabled = running;
  dom.open.disabled = running;
}

function liveSync(machine) {
  while (state.renderedOutputs < machine.out.length) {
    dom.output.append(machine.out[state.renderedOutputs] + "\n");
    state.renderedOutputs++;
  }
  const rows = machine.trace.rows.length;
  if (rows !== state.renderedTraceRows) {
    state.renderedTraceRows = rows;
    renderTrace({ cols: machine.trace.cols, rows: machine.trace.rows, overflow: machine.trace.overflow });
    renderVariables(machine.snapshot());
  }
}

let paceCount = 0;

async function pace(machine) {
  if (state.stopRequested) { machine.stopRequested = true; return; }
  machine.interactive = state.stepMode || state.breakpoints.size > 0;
  liveSync(machine);
  const line = machine.currentLine;
  const lineChanged = Boolean(line) && line !== state.lastLine;
  if (lineChanged) {
    state.lastLine = line;
    highlightCurrent(line);
  }
  if (state.stepMode || (lineChanged && state.breakpoints.has(line))) {
    state.paused = true;
    setRunning(true);
    await new Promise((resolve) => { state.resume = resolve; });
    state.paused = false;
    state.resume = null;
  }
  if (++paceCount % 150 === 0) await new Promise((resolve) => setTimeout(resolve, 0));
}

function highlightCurrent(line) {
  state.currentDecorations = editor.deltaDecorations(state.currentDecorations, [{
    range: new monaco.Range(line, 1, line, 1),
    options: { isWholeLine: true, className: "current-line", glyphMarginClassName: "current-glyph", overviewRuler: { color: "#b4245a", position: 4 } },
  }]);
  editor.revealLineInCenterIfOutsideViewport(line);
  const activeRow = dom.trace.querySelector(`tr[data-line="${line}"]`);
  dom.trace.querySelectorAll("tr.current").forEach((row) => row.classList.remove("current"));
  if (activeRow) activeRow.classList.add("current");
}

function clearCurrent() {
  state.currentDecorations = editor.deltaDecorations(state.currentDecorations, []);
  dom.trace.querySelectorAll("tr.current").forEach((row) => row.classList.remove("current"));
}

async function askForInput(event) {
  dom.prompt.hidden = false;
  dom.promptVar.textContent = `INPUT ${event.name}`;
  dom.promptValue.value = "";
  const answer = await new Promise((resolve) => {
    const done = (value) => {
      dom.prompt.hidden = true;
      dom.promptOk.removeEventListener("click", ok);
      dom.promptCancel.removeEventListener("click", cancel);
      dom.promptValue.removeEventListener("keydown", onKey);
      resolve(value);
    };
    const ok = () => done(dom.promptValue.value);
    const cancel = () => done(undefined);
    const onKey = (e) => { if (e.key === "Enter") ok(); if (e.key === "Escape") cancel(); };
    dom.promptOk.addEventListener("click", ok);
    dom.promptCancel.addEventListener("click", cancel);
    dom.promptValue.addEventListener("keydown", onKey);
    setTimeout(() => dom.promptValue.focus(), 0);
  });
  return answer;
}

async function run() {
  const analysed = refresh();
  const statics = analysed.diagnostics.filter((d) => d.level === "error");
  if (statics.length) {
    toast(`${statics.length} error${statics.length > 1 ? "s" : ""} to fix before running`);
    revealLine(statics[0].pos.line);
    return;
  }
  clearCurrent();
  setRunning(true);
  state.stopRequested = false;
  state.lastLine = 0;
  state.renderedOutputs = 0;
  state.renderedTraceRows = -1;
  dom.output.textContent = "";

  const started = Date.now();
  const result = await runInteractive(model.getValue(), {
    dialect: state.dialect,
    inputs: parseInputs(),
    onInput: askForInput,
    onTick: pace,
    interactive: state.stepMode || state.breakpoints.size > 0,
  });
  const elapsed = Date.now() - started;

  renderOutput(result);
  renderTrace(result.trace);
  renderVariables(result.variables);
  renderDiagnostics([...result.errors, ...result.notes]);
  monaco.editor.setModelMarkers(model, "pseudocode", [...result.errors, ...result.notes].map((d) => ({
    severity: d.level === "error" ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
    startLineNumber: d.line, startColumn: d.col, endLineNumber: d.line, endColumn: d.col + 30,
    message: `${d.en}  ${d.zh}`,
  })));
  for (const error of result.errors) track("pseudocode-diagnostic", { code: error.code });
  for (const note of result.notes) track("pseudocode-diagnostic", { code: note.code });

  setRunning(false);
  state.stepMode = false;
  clearCurrent();
  const summary = `${result.steps} statements in ${elapsed} ms`;
  if (result.errors.length) {
    const span = document.createElement("span");
    span.className = "run-error";
    span.textContent = `\n${result.errors.length} error(s). ${summary}`;
    dom.output.appendChild(span);
  }
}

function step() {
  if (state.paused && state.resume) {
    state.stepMode = true;
    const resolve = state.resume;
    state.resume = null;
    resolve();
    return;
  }
  if (state.running) { state.stepMode = true; return; }
  state.stepMode = true;
  run();
}

function stop() {
  state.stopRequested = true;
  if (state.paused && state.resume) {
    const resolve = state.resume;
    state.resume = null;
    resolve();
  }
}

function reset() {
  dom.output.textContent = "";
  dom.trace.textContent = "";
  dom.vars.textContent = "";
  dom.traceNote.textContent = "";
  clearCurrent();
  refresh();
}

/* ------------------------------------------------------------ persistence */

function encodeState(object) {
  const bytes = new TextEncoder().encode(JSON.stringify(object));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeState(text) {
  let base = text.replace(/-/g, "+").replace(/_/g, "/");
  while (base.length % 4) base += "=";
  const binary = atob(base);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function shareLink() {
  const payload = { c: model.getValue(), i: dom.inputs.value, s: state.dialect };
  const url = `${location.origin}${location.pathname}#p=${encodeState(payload)}`;
  navigator.clipboard.writeText(url)
    .then(() => toast("Link copied — it opens with this program"))
    .catch(() => { location.hash = `p=${encodeState(payload)}`; toast("Link added to the address bar"); });
}

function saveFile() {
  const blob = new Blob([model.getValue()], { type: "text/plain;charset=utf-8" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = "program.pseudo";
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

function openFile(file) {
  const reader = new FileReader();
  reader.onload = () => { model.setValue(String(reader.result)); reset(); };
  reader.readAsText(file);
}

let toastTimer = null;
function toast(message) {
  let node = document.querySelector(".toast");
  if (!node) {
    node = document.createElement("div");
    node.className = "toast";
    document.body.appendChild(node);
  }
  node.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.remove(), 2600);
}

function track(event, data) {
  try {
    if (window.umami && typeof window.umami.track === "function") window.umami.track(event, data);
  } catch { /* analytics is optional */ }
}

/* ------------------------------------------------------------------ wiring */

function fillExamples() {
  dom.examples.textContent = "";
  const byGroup = new Map();
  for (const example of examplesFor(state.dialect)) {
    if (!byGroup.has(example.group)) byGroup.set(example.group, []);
    byGroup.get(example.group).push(example);
  }
  const placeholder = document.createElement("option");
  placeholder.textContent = "Load an example…";
  placeholder.value = "";
  dom.examples.appendChild(placeholder);
  for (const [group, examples] of byGroup) {
    const section = document.createElement("optgroup");
    section.label = group;
    for (const example of examples) {
      const option = document.createElement("option");
      option.value = example.name;
      option.textContent = example.name;
      option.title = example.blurb;
      section.appendChild(option);
    }
    dom.examples.appendChild(section);
  }
  dom.examples.addEventListener("change", () => {
    const example = examplesFor(state.dialect).find((e) => e.name === dom.examples.value);
    if (!example) return;
    model.setValue(example.code);
    dom.inputs.value = (example.inputs || []).join("\n");
    reset();
  });
}

function wireTabs() {
  document.querySelectorAll(".tabs .tab").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tabs .tab").forEach((b) => b.classList.toggle("active", b === button));
      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.toggle("active", panel.id === `tab-${button.dataset.tab}`);
      });
    });
  });
}

function wireDivider() {
  const split = document.querySelector(".split");
  let dragging = false;
  dom.divider.addEventListener("mousedown", () => { dragging = true; document.body.style.userSelect = "none"; });
  window.addEventListener("mouseup", () => { dragging = false; document.body.style.userSelect = ""; });
  window.addEventListener("mousemove", (event) => {
    if (!dragging) return;
    const width = split.getBoundingClientRect().width;
    const share = Math.min(Math.max(event.clientX - split.getBoundingClientRect().left, 320), width - 320);
    split.style.gridTemplateColumns = `${share}px 6px minmax(280px, 1fr)`;
  });
}

function wireBreakpoints() {
  editor.onMouseDown((event) => {
    if (!event.target || event.target.type !== monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) return;
    const line = event.target.position.lineNumber;
    if (state.breakpoints.has(line)) state.breakpoints.delete(line);
    else state.breakpoints.add(line);
    state.decorations = editor.deltaDecorations(state.decorations, [...state.breakpoints].map((row) => ({
      range: new monaco.Range(row, 1, row, 1),
      options: { glyphMarginClassName: "bp-glyph", isWholeLine: false },
    })));
  });
}

let saveTimer = null;
function autosave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORE.doc, model.getValue());
      localStorage.setItem(STORE.inputs, dom.inputs.value);
    } catch { /* private browsing */ }
  }, 400);
}

function restore() {
  const hash = /^#p=(.+)$/.exec(location.hash || "");
  if (hash) {
    try {
      const payload = decodeState(hash[1]);
      model.setValue(payload.c || "");
      dom.inputs.value = payload.i || "";
      state.dialect = payload.s === "0478" ? "0478" : "9618";
      return;
    } catch { /* a broken link should not block the editor */ }
  }
  state.dialect = localStorage.getItem(STORE.syllabus) === "0478" ? "0478" : "9618";
  const saved = localStorage.getItem(STORE.doc);
  if (saved) model.setValue(saved);
  else model.setValue(examplesFor(state.dialect)[0].code);
  dom.inputs.value = localStorage.getItem(STORE.inputs) || "";
}

function applyDialect(id, options = {}) {
  const d = dialectOf(id);
  state.dialect = d.id;
  document.querySelectorAll(".syllabus button").forEach((button) => {
    const on = button.dataset.syllabus === d.id;
    button.classList.toggle("active", on);
    button.setAttribute("aria-pressed", on ? "true" : "false");
  });
  if (model) model.updateOptions({ tabSize: d.indent, insertSpaces: true });
  if (window.monaco) monaco.languages.setMonarchTokensProvider("pseudocode", monarchFor(d));
  fillExamples();
  renderReference();
  try { localStorage.setItem(STORE.syllabus, d.id); } catch { /* private browsing */ }
  if (!options.silent) refresh();
}

function boot() {
  defineThemes();
  registerLanguage();
  registerCompletion();
  applyTheme(detectTheme());

  model = monaco.editor.createModel("", "pseudocode");
  editor = monaco.editor.create(dom.editor, {
    model,
    fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
    fontSize: 14,
    minimap: { enabled: false },
    glyphMargin: true,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    tabSize: 4,
    insertSpaces: true,
    renderWhitespace: "selection",
    padding: { top: 10 },
  });

  fillExamples();
  renderReference();
  wireTabs();
  wireDivider();
  wireBreakpoints();
  restore();
  applyDialect(state.dialect, { silent: true });
  refresh();

  let analyseTimer = null;
  model.onDidChangeContent(() => {
    autosave();
    clearTimeout(analyseTimer);
    analyseTimer = setTimeout(refresh, 260);
  });
  dom.inputs.addEventListener("input", autosave);

  dom.run.addEventListener("click", run);
  dom.stop.addEventListener("click", stop);
  dom.step.addEventListener("click", step);
  dom.reset.addEventListener("click", reset);
  dom.share.addEventListener("click", shareLink);
  dom.download.addEventListener("click", saveFile);
  dom.open.addEventListener("click", () => dom.file.click());
  dom.file.addEventListener("change", () => { if (dom.file.files[0]) openFile(dom.file.files[0]); });
  document.querySelectorAll(".syllabus button").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.syllabus === state.dialect) return;
      applyDialect(button.dataset.syllabus);
    });
  });
  dom.theme.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    localStorage.setItem(STORE.theme, next);
    applyTheme(next);
  });

  const observer = new MutationObserver(() => {
    const attr = document.documentElement.getAttribute("data-user-color-scheme");
    if ((attr === "dark" || attr === "light") && attr !== document.documentElement.getAttribute("data-theme")) {
      localStorage.removeItem(STORE.theme);
      applyTheme(attr);
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-user-color-scheme"] });

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, run);
  setRunning(false);
  window.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && !state.running) run();
  });
}

window.require.config({ paths: { vs: "vendor/monaco/vs" } });
window.require(["vs/editor/editor.main"], boot);
