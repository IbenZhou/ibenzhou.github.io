import { Diagnostic } from "./tokeniser.js";
import { V, typeName, isNumeric, fmt, boundsLabel, BUILTINS, checkBuiltinCall } from "./builtins.js";
import { dialectOf, builtinNote } from "./dialect.js";

const RETURN = Symbol("return");

class Limit extends Error {
  constructor(code, ctx) { super(code); this.code = code; this.ctx = ctx; }
}

class RuntimeStop extends Error {}

function defaultValue(type) {
  switch (type) {
    case "INTEGER": case "REAL": return 0;
    case "STRING": return "";
    case "CHAR": return " ";
    case "BOOLEAN": return false;
    case "DATE": return { day: 1, month: 1, year: 1900 };
    default: return 0;
  }
}

function newSlot(name, value, kind = "var") {
  return { name, value, kind };
}

class Scope {
  constructor(parent) { this.vars = new Map(); this.parent = parent; }
  define(name, slot) { this.vars.set(name.toUpperCase(), slot); return slot; }
  has(name) { return !!this.lookup(name); }
  lookup(name) {
    const key = name.toUpperCase();
    let s = this;
    while (s) { if (s.vars.has(key)) return s.vars.get(key); s = s.parent; }
    return null;
  }
  own(name) { return this.vars.has(name.toUpperCase()); }
}

class Trace {
  constructor(limit) {
    this.cols = [];
    this.rows = [];
    this.limit = limit;
    this.current = null;
    this.overflow = 0;
  }
  begin() { if (!this.current) this.current = { line: 0, cells: {}, out: "" }; }
  commit(line) {
    if (!this.current) return;
    const row = this.current;
    this.current = null;
    row.line = line || row.line;
    if (!Object.keys(row.cells).length && !row.out) return;
    if (this.rows.length >= this.limit) { this.overflow++; return; }
    for (const name of Object.keys(row.cells)) if (!this.cols.includes(name)) this.cols.push(name);
    this.rows.push(row);
  }
  touch(name, text, line) {
    this.begin();
    if (!this.current) return;
    if (!line) line = 0;
    if (this.current.line === 0) this.current.line = line;
    this.current.cells[name] = text;
  }
  write(text) {
    this.begin();
    if (this.current) {
      if (!this.current.out) this.current.line = this.current.line || 0;
      this.current.out += text;
    }
  }
}

export class Machine {
  constructor(parsed, opts = {}) {
    this.dialect = dialectOf(opts.dialect);
    this.program = parsed.program;
    this.diag = [];
    this.notes = [];
    this.out = [];
    this.routines = new Map();
    this.inputs = [...(opts.inputs || [])];
    this.maxSteps = opts.maxSteps ?? 1000000;
    this.timeLimitMs = opts.timeLimitMs ?? 5000;
    this.traceLimit = opts.traceLimit ?? 500;
    this.recursionLimit = opts.recursionLimit ?? 200;
    this.seed = opts.seed ?? 12345;
    this.state = this.seed;
    this.steps = 0;
    this.startedAt = Date.now();
    this.stopRequested = false;
    this.interactive = opts.interactive ?? false;
    this.trace = new Trace(this.traceLimit);
    this.traceDepth = 0;
    this.loopStack = [];
    this.globals = new Scope(null);
    this.callStack = [];
    this.lastFrames = new Map();
    this.outputLine = "";
  }

  random() {
    this.state = (this.state * 1103515245 + 12345) & 0x7fffffff;
    return this.state / 0x7fffffff;
  }

  report(code, pos, ctx, fix, level) {
    const d = new Diagnostic(code, pos, ctx, fix);
    if (level === "note" || d.level === "note") {
      this.notes.push(d);
      return;
    }
    if (!this.diag.some((e) => e.code === code && e.pos && pos && e.pos.line === pos.line && e.pos.col === pos.col)) {
      this.diag.push(d);
    }
    throw new RuntimeStop();
  }

  *run() {
    const main = [];
    for (const node of this.program) {
      if (node.k === "proc" || node.k === "func") {
        this.routines.set(String(node.name).toUpperCase(), node);
        continue;
      }
      if (node.k === "declare") {
        for (const item of node.items) this.declareGlobal(item);
        continue;
      }
      if (node.k === "constant") {
        const value = yield* this.eval(node.value, this.globals);
        this.globals.define(node.name, newSlot(node.name, value, "const"));
        continue;
      }
      main.push(node);
    }
    yield* this.execBody(main, this.globals);
    this.trace.commit(0);
  }

  declareGlobal(item) {
    if (item.type === "ARRAY") {
      const dims = [];
      let size = 1;
      for (const [loExpr, hiExpr] of item.bounds) {
        const lo = Number(this.constNum(loExpr));
        const hi = Number(this.constNum(hiExpr));
        dims.push([lo, hi]);
        size *= Math.max(0, hi - lo + 1);
      }
      if (dims.length > 2) this.report("E_UNSUPPORTED", item.pos, { kw: "arrays with more than two dimensions" });
      const data = new Array(size).fill(null).map(() => V(item.of === "UNSUPPORTED" ? "INTEGER" : item.of, defaultValue(item.of)));
      this.globals.define(item.name, newSlot(item.name, V("ARRAY", { of: item.of, dims, data })));
      return;
    }
    const t = item.type === "UNSUPPORTED" ? "INTEGER" : item.type;
    this.globals.define(item.name, newSlot(item.name, V(t, defaultValue(t))));
  }

  constNum(expr) {
    if (!expr) return 0;
    if (expr.k === "num") return expr.v;
    if (expr.k === "un" && expr.op === "-") return -this.constNum(expr.e);
    if (expr.k === "var") {
      const slot = this.globals.lookup(expr.name);
      if (slot) return Number(slot.value.v) || 0;
      this.report("E_UNDECLARED", expr.pos, { name: expr.name, suggested: "INTEGER" });
      return 0;
    }
    return 0;
  }

  // ------------------------------------------------------------------ statements

  *execBody(body, scope) {
    for (const stmt of body) {
      if (stmt) yield* this.execStatement(stmt, scope);
    }
  }

  *execStatement(stmt, scope) {
    if (stmt.pos) this.currentLine = stmt.pos.line;
    yield* this.budget(stmt.pos);
    const traceable = ["assign", "input", "output", "call", "return"].includes(stmt.k);
    const ownRow = traceable && this.traceDepth === 0;
    if (ownRow) this.trace.begin();
    try {
      yield* this.dispatch(stmt, scope);
    } finally {
      if (ownRow) this.trace.commit(stmt.pos ? stmt.pos.line : 0);
    }
  }

  *dispatch(stmt, scope) {
    switch (stmt.k) {
      case "assign": return yield* this.execAssign(stmt, scope);
      case "output": return yield* this.execOutput(stmt, scope);
      case "input": return yield* this.execInput(stmt, scope);
      case "if": return yield* this.execIf(stmt, scope);
      case "case": return yield* this.execCase(stmt, scope);
      case "for": return yield* this.execFor(stmt, scope);
      case "while": return yield* this.execWhile(stmt, scope);
      case "repeat": return yield* this.execRepeat(stmt, scope);
      case "call": return yield* this.execCallStatement(stmt, scope);
      case "return": return yield* this.execReturn(stmt, scope);
      default: return undefined;
    }
  }

  *budget(pos) {
    this.steps++;
    if (this.steps > this.maxSteps) {
      const loop = this.loopStack[this.loopStack.length - 1];
      throw new Limit("E_STEP_LIMIT", { steps: this.maxSteps, kind: loop ? loop.kind : "program", line: loop ? loop.line : (pos ? pos.line : 1) });
    }
    if (this.stopRequested) throw new Limit("E_STOPPED", {});
    const periodic = this.steps % 512 === 0;
    if (!this.interactive && periodic && Date.now() - this.startedAt > this.timeLimitMs) {
      const loop = this.loopStack[this.loopStack.length - 1];
      throw new Limit("E_TIME_LIMIT", { seconds: Math.round(this.timeLimitMs / 1000), kind: loop ? loop.kind : "program", line: loop ? loop.line : (pos ? pos.line : 1) });
    }
    if (this.interactive || periodic) {
      yield { type: this.interactive ? "step" : "tick", steps: this.steps, line: this.currentLine };
    }
  }

  slotOf(target, scope) {
    const slot = scope.lookup(target.name);
    if (!slot) {
      const created = newSlot(target.name, V("INTEGER", 0));
      scope.define(target.name, created);
      return { slot: created, element: null };
    }
    if (target.k === "index") {
      if (slot.value.t !== "ARRAY") return { slot, element: null, bad: "notarray" };
      return { slot, element: target.dims };
    }
    return { slot, element: null };
  }

  *execAssign(stmt, scope) {
    if (!stmt.target || !stmt.expr) return;
    const value = yield* this.eval(stmt.expr, scope);
    yield* this.assignTo(stmt.target, value, scope, stmt.pos);
  }

  *assignTo(target, value, scope, pos) {
    const { slot, element, bad } = this.slotOf(target, scope);
    if (slot.kind === "const") {
      this.report("E_CONSTANT_ASSIGN", pos, { name: target.name });
      return;
    }
    if (bad === "notarray") {
      this.report("E_NOT_ARRAY", pos, { name: target.name, type: typeName(slot.value) });
      return;
    }
    if (element) {
      const result = yield* this.writeElement(slot, target, element, value, scope, pos);
      if (result) return;
      return;
    }
    if (value.t === "ARRAY") {
      const current = slot.value;
      if (current.t !== "ARRAY") {
        this.report("E_ARRAY_RHS", pos, { a: target.name, b: "not an array" });
        return;
      }
      const sameShape = JSON.stringify(current.v.dims) === JSON.stringify(value.v.dims) && current.v.of === value.v.of;
      if (!sameShape) {
        this.report("E_ARRAY_RHS", pos, { a: target.name, b: "another array" });
        return;
      }
      slot.value = V("ARRAY", { of: value.v.of, dims: value.v.dims, data: value.v.data.map((x) => ({ ...x })) });
      this.trace.touch(target.name, fmt(slot.value), pos.line);
      return;
    }
    this.checkAssignType(slot, value, target, pos);
    slot.value = coerceForSlot(slot, value);
    this.trace.touch(target.name, fmt(slot.value), pos.line);
  }

  checkAssignType(slot, value, target, pos) {
    const declared = slot.value.t;
    if (declared === value.t) return;
    if ((declared === "INTEGER" || declared === "REAL") && (value.t === "INTEGER" || value.t === "REAL")) return;
    if (declared === "STRING" && value.t === "CHAR") return;
    this.report("W_TYPE_ASSIGN", pos, { name: target.name, type: declared, got: typeName(value) }, null, "note");
  }

  *writeElement(slot, target, dims, value, scope, pos) {
    const arr = slot.value.v;
    if (dims.length !== arr.dims.length) {
      this.report("E_OUT_OF_BOUNDS", pos, { name: target.name, index: "wrong number of subscripts", lo: arr.dims[0][0], hi: arr.dims[0][1] });
      return false;
    }
    let flat = 0;
    let stride = 1;
    const shown = [];
    for (let i = dims.length - 1; i >= 0; i--) {
      const idx = yield* this.eval(dims[i], scope);
      if (!isNumeric(idx) || !Number.isInteger(Number(idx.v))) {
        this.report("E_INDEX_TYPE", pos, { name: target.name, got: typeName(idx) });
        return false;
      }
      const [lo, hi] = arr.dims[i];
      if (idx.v < lo || idx.v > hi) {
        this.report("E_OUT_OF_BOUNDS", pos, { name: target.name, index: idx.v, lo, hi });
        return false;
      }
      shown.unshift(idx.v);
      flat += (idx.v - lo) * stride;
      stride *= hi - lo + 1;
    }
    const element = arr.data[flat];
    if (value.t !== element.t) this.report("W_TYPE_ASSIGN", pos, { name: `${slot.name}[${shown.join(",")}]`, type: element.t, got: typeName(value) }, null, "note");
    arr.data[flat] = coerceElement(element, value);
    this.trace.touch(slot.name, fmt(slot.value), pos.line);
    return true;
  }

  *execOutput(stmt, scope) {
    let text = "";
    for (const expr of stmt.exprs) {
      const v = yield* this.eval(expr, scope);
      text += fmt(v);
    }
    this.out.push(text);
    this.trace.write(text);
  }

  *execInput(stmt, scope) {
    if (!stmt.target) return;
    const raw = yield* this.readInputLine(stmt);
    let current;
    if (stmt.target.k === "index") {
      current = yield* this.readIndex(stmt.target, scope);
    } else {
      const { slot } = this.slotOf(stmt.target, scope);
      if (slot.value.t === "ARRAY") {
        this.report("E_UNSUPPORTED", stmt.pos, { kw: `INPUT of a whole array (use INPUT ${stmt.target.name}[index])` });
        return;
      }
      if (slot.kind === "const") {
        this.report("E_CONSTANT_ASSIGN", stmt.pos, { name: stmt.target.name });
        return;
      }
      current = slot.value;
    }
    const parsed = parseInputValue(raw, current.t);
    if (!parsed.ok) {
      this.report("E_INPUT_TYPE", stmt.pos, { name: stmt.target.name, type: current.t, text: JSON.stringify(raw) });
      return;
    }
    yield* this.assignTo(stmt.target, parsed.value, scope, stmt.pos);
  }

  *readInputLine(stmt) {
    if (this.inputs.length) return String(this.inputs.shift());
    const answer = yield { type: "input-request", name: stmt.target ? stmt.target.name : "", pos: stmt.pos };
    if (answer === undefined || answer === null) {
      this.report("W_MISSING_INPUT", stmt.pos, {}, null, "note");
      return "";
    }
    return String(answer);
  }

  *execIf(stmt, scope) {
    const cond = yield* this.eval(stmt.cond, scope);
    if (truthy(cond)) yield* this.execBody(stmt.then, scope);
    else if (stmt.else) yield* this.execBody(stmt.else, scope);
  }

  *execCase(stmt, scope) {
    const subject = yield* this.eval(stmt.subject, scope);
    for (const arm of stmt.arms) {
      for (const spec of arm.values) {
        const lo = yield* this.eval(spec.lo, scope);
        let matched = false;
        if (spec.hi) {
          const hi = yield* this.eval(spec.hi, scope);
          matched = compareValues(lo, hi) !== null && compareValues(subject, lo) >= 0 && compareValues(subject, hi) <= 0;
        } else {
          matched = equalValues(subject, lo);
        }
        if (matched) { yield* this.execBody(arm.body, scope); return; }
      }
    }
    if (stmt.otherwise) yield* this.execBody(stmt.otherwise, scope);
  }

  *execFor(stmt, scope) {
    const from = yield* this.eval(stmt.from, scope);
    const to = yield* this.eval(stmt.to, scope);
    const stepNode = stmt.step || { k: "num", v: 1, t: "INTEGER", pos: stmt.pos };
    const step = yield* this.eval(stepNode, scope);
    if (!isNumeric(from) || !isNumeric(to) || !isNumeric(step)) {
      this.report("E_TYPE_OPERAND", stmt.pos, { op: "FOR", want: "INTEGER bounds", side: "", got: "" });
      return;
    }
    const increment = Number(step.v) || 1;
    let v = Math.trunc(Number(from.v));
    const limit = Math.trunc(Number(to.v));
    const name = stmt.var || "I";
    let slot = scope.lookup(name);
    if (!slot) slot = scope.define(name, newSlot(name, V("INTEGER", v)));
    this.loopStack.push({ kind: "FOR", line: stmt.pos.line });
    try {
      if (increment > 0) {
        for (; v <= limit; v += increment) {
          yield* this.budget(stmt.pos);
          slot.value = V("INTEGER", v);
          yield* this.iteration(stmt.body, scope, name, stmt.pos);
        }
      } else {
        for (; v >= limit; v += increment) {
          yield* this.budget(stmt.pos);
          slot.value = V("INTEGER", v);
          yield* this.iteration(stmt.body, scope, name, stmt.pos);
        }
      }
    } finally {
      this.loopStack.pop();
    }
  }

  *iteration(body, scope, loopVar, pos) {
    this.trace.begin();
    if (loopVar) {
      const slot = scope.lookup(loopVar);
      if (slot) this.trace.touch(loopVar, String(slot.value.v), pos.line);
    }
    this.traceDepth++;
    try {
      yield* this.execBody(body, scope);
    } finally {
      this.traceDepth--;
      this.trace.commit(pos.line);
    }
  }

  *execWhile(stmt, scope) {
    this.loopStack.push({ kind: "WHILE", line: stmt.pos.line });
    try {
      for (;;) {
        yield* this.budget(stmt.pos);
        const cond = yield* this.eval(stmt.cond, scope);
        if (!truthy(cond)) break;
        yield* this.iteration(stmt.body, scope, null, stmt.pos);
      }
    } finally {
      this.loopStack.pop();
    }
  }

  *execRepeat(stmt, scope) {
    this.loopStack.push({ kind: "REPEAT", line: stmt.pos.line });
    try {
      for (;;) {
        yield* this.budget(stmt.pos);
        yield* this.iteration(stmt.body, scope, null, stmt.pos);
        const cond = yield* this.eval(stmt.cond, scope);
        if (truthy(cond)) break;
      }
    } finally {
      this.loopStack.pop();
    }
  }

  *execCallStatement(stmt, scope) {
    const routine = this.routines.get(String(stmt.name).toUpperCase());
    if (!routine) {
      this.report("E_UNKNOWN_FUNC", stmt.pos, { name: stmt.name });
      return;
    }
    if (routine.k === "func") {
      this.report("E_PROC_NOT_SUB", stmt.pos, { name: stmt.name });
      return;
    }
    if (routine.params.length !== stmt.args.length) {
      this.report("E_ARITY", stmt.pos, { name: routine.name, want: routine.params.length, got: stmt.args.length });
      return;
    }
    const args = [];
    for (const a of stmt.args) args.push(yield* this.eval(a, scope));
    yield* this.invokeWithValues(routine, args, stmt.args, scope, stmt.pos);
  }

  *execReturn(stmt, scope) {
    const value = stmt.expr ? yield* this.eval(stmt.expr, scope) : null;
    throw { __return: RETURN, value };
  }

  elementProxy(arraySlot, indexes, pos) {
    const arr = arraySlot.value.v;
    let flat = 0;
    let stride = 1;
    for (let i = indexes.length - 1; i >= 0; i--) {
      const [lo, hi] = arr.dims[i] || [0, 0];
      const idx = indexes[i];
      if (idx < lo || idx > hi) {
        this.report("E_OUT_OF_BOUNDS", pos, { name: arraySlot.name, index: indexes.join(","), lo, hi });
        return newSlot(arraySlot.name, V(arr.of, defaultValue(arr.of)));
      }
      flat += (idx - lo) * stride;
      stride *= hi - lo + 1;
    }
    const slot = { name: arraySlot.name, kind: "var", proxy: true };
    Object.defineProperty(slot, "value", {
      get: () => arr.data[flat],
      set: (v) => { arr.data[flat] = v; },
    });
    return slot;
  }

  // ------------------------------------------------------------------ expressions

  *eval(node, scope) {
    if (!node) return V("INTEGER", 0);
    switch (node.k) {
      case "num": return V(node.t, node.v);
      case "str": return V("STRING", node.v);
      case "char": return V("CHAR", node.v);
      case "bool": return V("BOOLEAN", node.v);
      case "date": return V("DATE", node.v);
      case "var": return this.readVar(node, scope);
      case "index": return yield* this.readIndex(node, scope);
      case "call": return yield* this.evalCall(node, scope);
      case "un": return yield* this.evalUnary(node, scope);
      case "bin": return yield* this.evalBinary(node, scope);
      default: return V("INTEGER", 0);
    }
  }

  readVar(node, scope) {
    const slot = scope.lookup(node.name);
    if (!slot) {
      const created = newSlot(node.name, V("INTEGER", 0));
      scope.define(node.name, created);
      return created.value;
    }
    return slot.value;
  }

  *readIndex(node, scope) {
    const slot = scope.lookup(node.name);
    if (!slot || slot.value.t !== "ARRAY") {
      if (slot) this.report("E_NOT_ARRAY", node.pos, { name: node.name, type: typeName(slot.value) });
      else this.report("E_UNDECLARED", node.pos, { name: node.name, suggested: "INTEGER" });
      return V("INTEGER", 0);
    }
    const arr = slot.value.v;
    const dims = [];
    for (const d of node.dims) {
      const v = yield* this.eval(d, scope);
      if (!isNumeric(v) || !Number.isInteger(Number(v.v))) {
        this.report("E_INDEX_TYPE", node.pos, { name: node.name, got: typeName(v) });
        return V(arr.of, defaultValue(arr.of));
      }
      dims.push(v.v);
    }
    if (dims.length !== arr.dims.length) {
      this.report("E_OUT_OF_BOUNDS", node.pos, { name: node.name, index: dims.join(","), lo: arr.dims[0][0], hi: arr.dims[0][1] });
      return V(arr.of, defaultValue(arr.of));
    }
    let flat = 0;
    let stride = 1;
    for (let i = dims.length - 1; i >= 0; i--) {
      const [lo, hi] = arr.dims[i];
      if (dims[i] < lo || dims[i] > hi) {
        this.report("E_OUT_OF_BOUNDS", node.pos, { name: node.name, index: dims.join(","), lo, hi });
        return V(arr.of, defaultValue(arr.of));
      }
      flat += (dims[i] - lo) * stride;
      stride *= hi - lo + 1;
    }
    return arr.data[flat];
  }

  *evalUnary(node, scope) {
    const v = yield* this.eval(node.e, scope);
    if (node.op === "NOT") {
      if (v.t !== "BOOLEAN") {
        this.report("E_TYPE_OPERAND", node.pos, { op: "NOT", want: "BOOLEAN", side: "", got: typeName(v) });
        return V("BOOLEAN", false);
      }
      return V("BOOLEAN", !v.v);
    }
    if (!isNumeric(v)) {
      this.report("E_TYPE_OPERAND", node.pos, { op: node.op, want: "a number", side: "", got: typeName(v) });
      return V("INTEGER", 0);
    }
    return V(v.t, node.op === "-" ? -v.v : v.v);
  }

  *evalBinary(node, scope) {
    if (node.op === "AND" || node.op === "OR") {
      const l = yield* this.eval(node.l, scope);
      const left = truthy(l);
      if (node.op === "AND" && !left) return V("BOOLEAN", false);
      if (node.op === "OR" && left) return V("BOOLEAN", true);
      const r = yield* this.eval(node.r, scope);
      return V("BOOLEAN", node.op === "AND" ? truthy(r) : truthy(r));
    }
    const l = yield* this.eval(node.l, scope);
    const r = yield* this.eval(node.r, scope);
    return this.applyBinary(node.op, l, r, node.pos);
  }

  applyBinary(op, l, r, pos) {
    if (op === "&") {
      if (l.t !== "STRING" && l.t !== "CHAR") this.report("W_CONCAT_MIXED", pos, { got: typeName(l) }, null, "note");
      if (r.t !== "STRING" && r.t !== "CHAR") this.report("W_CONCAT_MIXED", pos, { got: typeName(r) }, null, "note");
      return V("STRING", stringify(l) + stringify(r));
    }
    if (["=", "<>"].includes(op)) return V("BOOLEAN", op === "=" ? equalValues(l, r) : !equalValues(l, r));
    if (["<", ">", "<=", ">="].includes(op)) {
      const c = compareValues(l, r);
      if (c === null) {
        this.report("E_TYPE_OPERAND", pos, { op, want: "two values of the same type", side: "", got: `${typeName(l)} and ${typeName(r)}` });
        return V("BOOLEAN", false);
      }
      return V("BOOLEAN", op === "<" ? c < 0 : op === ">" ? c > 0 : op === "<=" ? c <= 0 : c >= 0);
    }
    if (op === "+" || op === "-" || op === "*") {
      if (!isNumeric(l) || !isNumeric(r)) {
        if ((l.t === "STRING" || l.t === "CHAR") && (r.t === "STRING" || r.t === "CHAR")) {
          this.report("E_STRING_PLUS", pos, { example: `${stringify(l)} & ${stringify(r)}` });
          return V("STRING", stringify(l) + stringify(r));
        }
        this.report("E_TYPE_OPERAND", pos, { op, want: "numbers", side: "", got: `${typeName(l)} and ${typeName(r)}` });
        return V("INTEGER", 0);
      }
      const t = l.t === "REAL" || r.t === "REAL" ? "REAL" : "INTEGER";
      const v = op === "+" ? l.v + r.v : op === "-" ? l.v - r.v : l.v * r.v;
      return V(t, v);
    }
    if (op === "^") {
      if (!isNumeric(l) || !isNumeric(r)) {
        this.report("E_TYPE_OPERAND", pos, { op, want: "numbers", side: "", got: `${typeName(l)} and ${typeName(r)}` });
        return V("INTEGER", 0);
      }
      const value = Math.pow(Number(l.v), Number(r.v));
      const integral = l.t === "INTEGER" && r.t === "INTEGER" && Number(r.v) >= 0;
      return integral ? V("INTEGER", Math.round(value)) : V("REAL", value);
    }
    if (op === "/") {      if (!isNumeric(l) || !isNumeric(r)) {
        this.report("E_TYPE_OPERAND", pos, { op, want: "numbers", side: "", got: `${typeName(l)} and ${typeName(r)}` });
        return V("REAL", 0);
      }
      if (Number(r.v) === 0) { this.report("E_DIV_ZERO", pos, { line: pos.line }); return V("REAL", 0); }
      return V("REAL", Number(l.v) / Number(r.v));
    }
    if (op === "DIV" || op === "MOD") {
      if (!isNumeric(l) || !isNumeric(r) || l.t !== "INTEGER" || r.t !== "INTEGER") {
        this.report("E_INT_OPERAND", pos, { op, got: `${typeName(l)} and ${typeName(r)}` });
        return V("INTEGER", 0);
      }
      if (Number(r.v) === 0) {
        this.report(op === "DIV" ? "E_DIV_ZERO" : "E_MOD_ZERO", pos, { line: pos.line });
        return V("INTEGER", 0);
      }
      return V("INTEGER", op === "DIV" ? Math.trunc(l.v / r.v) : l.v % r.v);
    }
    this.report("E_UNEXPECTED", pos, { what: `operator '${op}'` });
    return V("INTEGER", 0);
  }

  *evalCall(node, scope) {
    const upper = String(node.name).toUpperCase();
    const args = [];
    for (const a of node.args) args.push(yield* this.eval(a, scope));
    if (BUILTINS[upper]) {
      const away = builtinNote(upper, this.dialect);
      if (away) this.notes.push(new Diagnostic(away.code, node.pos, away.ctx || {}));
      const before = this.diag.length;
      const fn = checkBuiltinCall(upper, args, node.pos, this.diag, this.dialect);
      if (!fn) { this.report("E_UNKNOWN_FUNC", node.pos, { name: node.name }); return V("INTEGER", 0); }
      if (this.diag.length > before) throw new RuntimeStop();
      const ctx = { diag: this.diag, pos: node.pos, random: () => this.random() };
      return fn.call(args, ctx);
    }
    const routine = this.routines.get(upper);
    if (!routine) {
      this.report("E_UNKNOWN_FUNC", node.pos, { name: node.name });
      return V("INTEGER", 0);
    }
    if (routine.k === "proc") {
      this.report("E_NOT_A_FUNC", node.pos, { name: node.name });
      return V("INTEGER", 0);
    }
    if (routine.params.length !== args.length) {
      this.report("E_ARITY", node.pos, { name: node.name, want: routine.params.length, got: args.length });
      return V(routine.retType || "INTEGER", defaultValue(routine.retType));
    }
    const argNodes = node.args;
    const result = yield* this.invokeWithValues(routine, args, argNodes, scope, node.pos);
    return result || V(routine.retType || "INTEGER", defaultValue(routine.retType));
  }

  *invokeWithValues(routine, argValues, argNodes, callerScope, pos) {
    const key = String(routine.name).toUpperCase();
    this.callStack.push(key);
    const selfDepth = this.callStack.filter((x) => x === key).length;
    if (selfDepth > this.recursionLimit || this.callStack.length > this.recursionLimit * 4) {
      this.callStack.pop();
      this.report("E_RECURSION", pos, { name: routine.name, depth: this.recursionLimit });
      return null;
    }
    const frame = new Scope(this.globals);
    for (let i = 0; i < routine.params.length; i++) {
      const param = routine.params[i];
      const argNode = argNodes ? argNodes[i] : null;
      let bound = false;
      if (param.byref && argNode) {
        const target = callerScope.lookup(argNode.name);
        if (argNode.k === "var" && target) {
          frame.define(param.name, target);
          bound = true;
        } else if (argNode.k === "index" && target && target.value.t === "ARRAY") {
          const idx = [];
          for (const d of argNode.dims) {
            const v = yield* this.eval(d, callerScope);
            idx.push(Number(v.v));
          }
          frame.define(param.name, this.elementProxy(target, idx, pos));
          bound = true;
        }
      }
      if (!bound) {
        frame.define(param.name, newSlot(param.name, argValues[i] || V(typeOfParam(param), defaultValue(typeOfParam(param)))));
      }
    }
    let result = null;
    try {
      yield* this.execBody(routine.body, frame);
      if (routine.k === "func") this.report("E_MISSING_RETURN", routine.pos, { name: routine.name });
    } catch (e) {
      if (e && e.__return === RETURN) result = e.value;
      else throw e;
    } finally {
      this.callStack.pop();
      this.lastFrames.set(key, frame);
    }
    if (result && routine.retType && routine.retType !== "UNSUPPORTED" && result.t !== routine.retType) {
      if (!(isNumeric(result) && (routine.retType === "INTEGER" || routine.retType === "REAL"))) {
        this.report("W_TYPE_ASSIGN", pos, { name: `RETURN of ${routine.name}`, type: routine.retType, got: typeName(result) }, null, "note");
      }
    }
    return result;
  }

  snapshot() {
    const rows = [];
    const push = (slot, scopeName) => {
      rows.push({
        scope: scopeName,
        name: slot.name,
        type: slot.value.t === "ARRAY" ? boundsLabel(slot.value) : slot.value.t,
        value: fmt(slot.value),
        dims: slot.value.t === "ARRAY" ? slot.value.v.dims : null,
      });
    };
    for (const [, slot] of this.globals.vars) push(slot, "");
    for (const [name, frame] of this.lastFrames) {
      const routine = this.routines.get(name);
      if (!routine) continue;
      for (const p of routine.params) {
        const slot = frame.lookup(p.name);
        if (slot) push({ ...slot, name: p.name }, routine.name);
      }
    }
    return rows;
  }
}

function typeOfParam(param) {
  return param.type && param.type !== "UNSUPPORTED" ? param.type : "INTEGER";
}

function coerceForSlot(slot, value) {
  const t = slot.value.t;
  if (t === "REAL" && value.t === "INTEGER") return V("REAL", Number(value.v));
  if (t === "INTEGER" && value.t === "REAL") return V("INTEGER", Math.trunc(value.v));
  if (t === "STRING" && (value.t === "CHAR" || value.t === "INTEGER" || value.t === "REAL")) return V("STRING", stringify(value));
  return value;
}

function coerceElement(element, value) {
  const t = element.t;
  if (t === value.t) return V(t, value.v);
  if (t === "REAL" && isNumeric(value)) return V("REAL", Number(value.v));
  if (t === "INTEGER" && isNumeric(value)) return V("INTEGER", Math.trunc(Number(value.v)));
  if (t === "STRING") return V("STRING", stringify(value));
  if (t === "CHAR") return V("CHAR", String(value.v).slice(0, 1));
  return V(t, value.v);
}

function stringify(v) {
  if (!v) return "";
  if (v.t === "INTEGER") return String(v.v);
  if (v.t === "REAL") return fmtReal(v.v);
  if (v.t === "BOOLEAN") return v.v ? "TRUE" : "FALSE";
  return String(v.v);
}

function fmtReal(n) {
  if (Number.isInteger(n)) return String(n) + ".0";
  return String(Math.round(n * 1e10) / 1e10);
}

function truthy(v) {
  if (!v) return false;
  if (v.t === "BOOLEAN") return !!v.v;
  if (isNumeric(v)) return Number(v.v) !== 0;
  return true;
}

export function parseInputValue(raw, type) {
  const text = String(raw);
  switch (type) {
    case "INTEGER":
      if (/^-?\d+$/.test(text.trim())) return { ok: true, value: V("INTEGER", parseInt(text.trim(), 10)) };
      return { ok: false };
    case "REAL":
      if (/^-?(\d+\.\d*|\.\d+|\d+)$/.test(text.trim())) return { ok: true, value: V("REAL", parseFloat(text.trim())) };
      return { ok: false };
    case "BOOLEAN": {
      const t = text.trim().toUpperCase();
      if (t === "TRUE") return { ok: true, value: V("BOOLEAN", true) };
      if (t === "FALSE") return { ok: true, value: V("BOOLEAN", false) };
      return { ok: false };
    }
    case "CHAR":
      if (text.length === 1) return { ok: true, value: V("CHAR", text) };
      return { ok: false };
    case "DATE": {
      const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim());
      if (m) return { ok: true, value: V("DATE", { day: +m[1], month: +m[2], year: +m[3] }) };
      return { ok: false };
    }
    default:
      return { ok: true, value: V("STRING", text) };
  }
}

function equalValues(a, b) {
  if (!a || !b) return false;
  if (isNumeric(a) && isNumeric(b)) return Number(a.v) === Number(b.v);
  if (a.t === "DATE" && b.t === "DATE") return a.v.day === b.v.day && a.v.month === b.v.month && a.v.year === b.v.year;
  if ((a.t === "STRING" || a.t === "CHAR") && (b.t === "STRING" || b.t === "CHAR")) return String(a.v) === String(b.v);
  if (a.t === "BOOLEAN" && b.t === "BOOLEAN") return !!a.v === !!b.v;
  return false;
}

function compareValues(a, b) {
  if (!a || !b) return null;
  if (isNumeric(a) && isNumeric(b)) return Number(a.v) - Number(b.v);
  if (a.t === "DATE" && b.t === "DATE") {
    const x = a.v; const y = b.v;
    return x.year - y.year || x.month - y.month || x.day - y.day;
  }
  if ((a.t === "STRING" || a.t === "CHAR") && (b.t === "STRING" || b.t === "CHAR")) {
    return String(a.v) < String(b.v) ? -1 : String(a.v) > String(b.v) ? 1 : 0;
  }
  return null;
}

export { Limit, RuntimeStop };
