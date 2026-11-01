import { tokenise } from "./tokeniser.js";
import { parse } from "./parser.js";
import { Machine, Limit, RuntimeStop } from "./interp.js";
import { describe } from "./diagnostics.js";
import { dialectOf } from "./dialect.js";

export const DEFAULTS = {
  maxSteps: 1000000,
  timeLimitMs: 5000,
  traceLimit: 500,
  recursionLimit: 200,
};

export function analyse(text, opts = {}) {
  const dialect = dialectOf(opts.dialect);
  const tok = tokenise(text, dialect);
  const parsed = parse(tok, dialect);
  const maxSteps = opts.maxSteps ?? tok.pragmas.maxSteps ?? DEFAULTS.maxSteps;
  return {
    program: parsed.program,
    diagnostics: parsed.diagnostics,
    pragmas: tok.pragmas,
    maxSteps,
    lines: tok.lines,
    dialect: dialect.id,
  };
}

function present(d) {
  const { en, zh } = describe(d.code, d.ctx || {});
  return {
    code: d.code,
    level: d.level,
    line: d.pos ? d.pos.line : 0,
    col: d.pos ? d.pos.col : 1,
    en,
    zh,
    fix: d.fix || null,
  };
}

function dedupe(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const key = `${item.code}:${item.line}:${item.col}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out.sort((a, b) =>
    a.level === b.level ? a.line - b.line : a.level === "error" ? -1 : 1);
}

function collect(machine, statics, limitError) {
  const errors = dedupe([
    ...statics.filter((d) => d.level === "error").map(present),
    ...machine.diag.map(present),
    ...(limitError ? [{ code: limitError.code, level: "error", line: (limitError.ctx && limitError.ctx.line) || 1, col: 1, ...describe(limitError.code, limitError.ctx || {}), fix: null }] : []),
  ]);
  const notes = dedupe([
    ...statics.filter((d) => d.level === "note").map(present),
    ...machine.notes.map(present),
  ]);
  return {
    output: machine.out.join("\n") + (machine.out.length ? "\n" : ""),
    lines: machine.out.slice(),
    errors,
    notes,
    variables: machine.snapshot(),
    trace: { cols: machine.trace.cols, rows: machine.trace.rows, overflow: machine.trace.overflow },
    steps: machine.steps,
    askedForInput: machine.askedForInput || 0,
    stopped: Boolean(limitError && limitError.code === "E_STOPPED"),
  };
}

export function formatDiagnostics(diagnostics) {
  return dedupe(diagnostics.map(present));
}

function prepare(text, opts) {
  const analysed = analyse(text, opts);
  const machine = new Machine({ program: analysed.program }, {
    inputs: opts.inputs ? [...opts.inputs] : [],
    maxSteps: analysed.maxSteps,
    timeLimitMs: opts.timeLimitMs ?? DEFAULTS.timeLimitMs,
    traceLimit: opts.traceLimit ?? DEFAULTS.traceLimit,
    recursionLimit: opts.recursionLimit ?? DEFAULTS.recursionLimit,
    seed: opts.seed ?? 12345,
    interactive: opts.interactive ?? false,
    dialect: analysed.dialect,
  });
  return { analysed, machine, iterator: machine.run() };
}

export function runSync(text, opts = {}) {
  const { analysed, machine, iterator } = prepare(text, opts);
  let limitError = null;
  let step;
  try {
    step = iterator.next();
    while (!step.done) {
      const event = step.value;
      if (event && event.type === "input-request") {
        machine.askedForInput = (machine.askedForInput || 0) + 1;
        step = iterator.next(opts.onInput ? opts.onInput(event) : undefined);
        continue;
      }
      step = iterator.next();
    }
  } catch (e) {
    if (e instanceof Limit) limitError = e;
    else if (e instanceof RuntimeStop) { /* the diagnostic is already recorded */ }
    else if (e && e.__return) machine.diag.push({ code: "E_STRAY_END", level: "error", pos: { line: 1, col: 1 }, ctx: { kw: "RETURN", open: "a FUNCTION" } });
    else throw e;
  }
  return collect(machine, analysed.diagnostics, limitError);
}

export async function runInteractive(text, opts = {}) {
  const { analysed, machine, iterator } = prepare(text, opts);
  let limitError = null;
  let step;
  try {
    step = iterator.next();
    for (;;) {
      if (step.done) break;
      const event = step.value;
      if (event && event.type === "input-request") {
        machine.askedForInput = (machine.askedForInput || 0) + 1;
        const answer = opts.onInput ? await opts.onInput(event, machine) : undefined;
        step = iterator.next(answer);
        continue;
      }
      if (opts.onTick) await opts.onTick(machine, event, iterator);
      step = iterator.next();
    }
  } catch (e) {
    if (e instanceof Limit) limitError = e;
    else if (e instanceof RuntimeStop) { /* the diagnostic is already recorded */ }
    else if (e && e.__return) machine.diag.push({ code: "E_STRAY_END", level: "error", pos: { line: 1, col: 1 }, ctx: { kw: "RETURN", open: "a FUNCTION" } });
    else throw e;
  }
  return collect(machine, analysed.diagnostics, limitError);
}

export { Machine, Limit, describe };
