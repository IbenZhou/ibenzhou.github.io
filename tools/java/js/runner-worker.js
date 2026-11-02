const CHEERPJ_URL = "https://cjrtnc.leaningtech.com/4.1/loader.js";

const send = (message) => self.postMessage(message);

let ready = false;
let busy = false;
let phase = "idle";
let compileText = "";
let runChars = 0;
let limitNoticeSent = false;
let runnerSource = "";
let toolsJarUrl = "";

function cleanConsoleText(text) {
  if (!text) return "";
  const kept = String(text)
    .split("\n")
    .filter((line) => !/^Deprecated: Use cheerpOSAddStringFile/.test(line))
    .join("\n");
  return kept;
}

function handleConsole(channel, text) {
  const cleaned = cleanConsoleText(text);
  if (!cleaned || !cleaned.trim()) return;
  const chunk = cleaned.endsWith("\n") ? cleaned : `${cleaned}\n`;
  if (phase === "compile") {
    compileText += chunk;
    return;
  }
  if (phase === "run") {
    if (runChars > 400000) {
      if (!limitNoticeSent) {
        limitNoticeSent = true;
        send({ type: "stdout", text: "\n[output limit reached — later lines are hidden]\n" });
      }
      return;
    }
    runChars += chunk.length;
    send({ type: channel === "stderr" ? "stderr" : "stdout", text: chunk });
  }
}

function installConsoleHook() {
  ["log", "info", "warn", "error", "debug"].forEach((name) => {
    console[name] = (...args) => {
      const text = args.map((value) => (typeof value === "string" ? value : String(value))).join(" ");
      handleConsole(name === "error" || name === "warn" ? "stderr" : "stdout", text);
    };
  });
}

installConsoleHook();

try {
  importScripts(CHEERPJ_URL);
} catch (error) {
  send({ type: "init-error", message: "Could not load the CheerpJ runtime script. Check your connection." });
}

function addStringFile(path, content) {
  const add = self.cheerpOSAddStringFile || self.cheerpjAddStringFile;
  return add(path, new TextEncoder().encode(String(content)));
}

async function preloadWithProgress(url) {
  if (!url) return;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not download the Java compiler (HTTP ${response.status}).`);
  const total = Number(response.headers.get("content-length")) || 0;
  if (!response.body || typeof response.body.getReader !== "function") {
    await response.arrayBuffer();
    send({ type: "progress", loaded: total, total });
    return;
  }
  const reader = response.body.getReader();
  let loaded = 0;
  let lastReport = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    loaded += value.length;
    if (loaded - lastReport > 512 * 1024) {
      lastReport = loaded;
      send({ type: "progress", loaded, total });
    }
  }
  send({ type: "progress", loaded, total: total || loaded });
}

let warmupPromise = null;
const toolsClasspath = "/app/tools.jar";

async function warmup(message) {
  if (ready) {
    send({ type: "ready" });
    return;
  }
  if (warmupPromise) return warmupPromise;
  runnerSource = message.runnerSource || runnerSource;
  toolsJarUrl = message.toolsJarUrl || toolsJarUrl;
  warmupPromise = (async () => {
    try {
      phase = "warmup";
      send({ type: "status", phase: "runtime", detail: "Starting Java runtime" });
      await cheerpjInit({ version: 8, status: "none" });
      send({ type: "status", phase: "compiler", detail: "Loading Java compiler" });
      await preloadWithProgress(toolsJarUrl);
      const code = await cheerpjRunMain("com.sun.tools.javac.Main", toolsClasspath, "-version");
      if (code !== 0) throw new Error(`The Java compiler did not start (exit ${code}).`);
      ready = true;
      phase = "idle";
      send({ type: "ready" });
    } catch (error) {
      phase = "idle";
      send({ type: "init-error", message: String((error && error.message) || error) });
    } finally {
      warmupPromise = null;
    }
  })();
  return warmupPromise;
}

function safeSourceName(name) {
  const value = String(name || "Main.java");
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*\.java$/.test(value)) return "Main.java";
  return value;
}

async function run(message) {
  if (!ready) {
    send({ type: "error", message: "The Java runtime is still loading. Wait for Ready, then run again." });
    return;
  }
  if (busy) {
    send({ type: "error", message: "A program is already running." });
    return;
  }
  busy = true;
  phase = "compile";
  compileText = "";
  try {
    const sourceName = safeSourceName(message.sourceFileName);
    send({ type: "status", phase: "compiling", detail: "Compiling" });
    await addStringFile(`/str/${sourceName}`, message.code || "");
    await addStringFile("/str/__JavaRunner.java", runnerSource);
    for (const dataset of message.datasets || []) {
      await addStringFile(`/str/${dataset.name}`, dataset.content || "");
    }
    await addStringFile("/str/input.txt", message.input || "");
    const compileCode = await cheerpjRunMain(
      "com.sun.tools.javac.Main",
      toolsClasspath,
      "-encoding", "UTF-8",
      "-nowarn",
      "-d", "/files/",
      "/str/__JavaRunner.java",
      `/str/${sourceName}`,
    );
    phase = "idle";
    send({ type: "compile", code: compileCode, text: compileText });
    compileText = "";
    if (compileCode !== 0) {
      busy = false;
      return;
    }

    phase = "run";
    runChars = 0;
    limitNoticeSent = false;
    send({ type: "status", phase: "running", detail: "Running" });
    const args = [message.mainClass || "Main", ...(message.datasets || []).map((dataset) => dataset.name)];
    const exitCode = await cheerpjRunMain("__JavaRunner", "/files/", ...args);
    phase = "idle";
    busy = false;
    send({ type: "run-done", code: exitCode });
  } catch (error) {
    phase = "idle";
    busy = false;
    send({ type: "error", message: String((error && error.stack) || error) });
  }
}

self.onmessage = (event) => {
  const message = event.data || {};
  if (message.type === "warmup") warmup(message);
  else if (message.type === "run") run(message);
};
