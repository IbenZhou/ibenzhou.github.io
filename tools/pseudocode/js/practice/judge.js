import { analyse, runSync } from "../engine.js";
import { buildProgram, resultOf } from "./tasks.js";

// Practice runs may legitimately be heavier than a classroom snippet.
export const PRACTICE_MAX_STEPS = 5000000;

function typeKey(type) {
  if (!type) return "ANY";
  if (typeof type === "string") return type;
  if (type.kind === "ARRAY") return `ARRAY<${type.of}>`;
  return String(type);
}

export function routineOf(code, name) {
  const analysed = analyse(code, { dialect: "9618" });
  const wanted = String(name).toUpperCase();
  return analysed.program.find(
    (node) => (node.k === "proc" || node.k === "func") && String(node.name).toUpperCase() === wanted,
  ) || null;
}

// Structural check for questions that only ask for a module header.
export function checkSignature(task, code) {
  const want = task.structure;
  if (!want) return { ok: true, note: "" };

  const found = routineOf(code, want.name);
  if (!found) return { ok: false, note: `没有找到 ${want.name}() 的定义` };

  const kindMatches = !want.kind || found.k === want.kind;
  if (!kindMatches) {
    const label = want.kind === "func" ? "FUNCTION" : "PROCEDURE";
    return { ok: false, note: `${want.name} 应该是 ${label}` };
  }

  if (want.params && found.params.length !== want.params.length) {
    return { ok: false, note: `${want.name} 需要 ${want.params.length} 个参数，你写了 ${found.params.length} 个` };
  }

  if (want.params) {
    for (let i = 0; i < want.params.length; i += 1) {
      const expected = want.params[i];
      const actual = typeKey(found.params[i].type);
      if (expected !== "ANY" && expected !== actual) {
        return { ok: false, note: `第 ${i + 1} 个参数应为 ${expected}，你写的是 ${actual}` };
      }
    }
  }

  if (want.returns) {
    const actual = typeKey(found.retType);
    if (want.returns !== "ANY" && want.returns !== actual) {
      return { ok: false, note: `返回类型应为 ${want.returns}，你写的是 ${actual}` };
    }
  }

  return { ok: true, note: "签名正确" };
}

// One case: run setup + answer + check block, then compare or predicate-test.
export function runCase(task, entry, code) {
  const program = buildProgram(task, entry, code);
  const result = runSync(program, {
    inputs: entry.inputs || [],
    maxSteps: PRACTICE_MAX_STEPS,
    seed: entry.seed,
    files: entry.files || task.files,
  });
  if (result.errors.length) {
    const first = result.errors[0];
    return { ok: false, note: `第 ${first.line} 行：${first.en}`, value: null };
  }
  const value = resultOf(result.output);
  if (typeof entry.check === "function") {
    let ok = false;
    try { ok = entry.check(value) === true; } catch { ok = false; }
    return { ok, note: ok ? "" : (entry.expect || "结果不符合题目要求"), value, files: result.files };
  }
  return { ok: null, note: "", value, files: result.files };
}
