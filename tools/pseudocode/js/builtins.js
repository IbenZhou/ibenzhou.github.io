import { Diagnostic } from "./tokeniser.js";

export const V = (t, v) => ({ t, v });

export function typeName(v) {
  if (!v) return "UNKNOWN";
  if (v.t === "ARRAY") return `${v.of} array`;
  return v.t;
}

export function isNumeric(v) {
  return v && (v.t === "INTEGER" || v.t === "REAL");
}

export function fmtNumber(n) {
  if (Number.isInteger(n)) return String(n) + ".0";
  const rounded = Math.round(n * 1e10) / 1e10;
  if (Number.isInteger(rounded)) return String(rounded) + ".0";
  return String(rounded);
}

export function fmt(v) {
  if (!v) return "";
  switch (v.t) {
    case "INTEGER": return String(v.v);
    case "REAL": return fmtNumber(v.v);
    case "BOOLEAN": return v.v ? "TRUE" : "FALSE";
    case "CHAR":
    case "STRING": return String(v.v);
    case "DATE": return `${pad2(v.v.day)}/${pad2(v.v.month)}/${v.v.year}`;
    case "ARRAY": return arrayPreview(v);
    default: return String(v.v);
  }
}

function pad2(n) { return String(n).padStart(2, "0"); }

function arrayPreview(v) {
  const { data } = v.v;
  const flat = data.filter((x) => x !== undefined);
  const shown = flat.slice(0, 10).map((x) => fmt(x));
  return `[${shown.join(", ")}${flat.length > 10 ? ", ..." : ""}]`;
}

export function boundsLabel(v) {
  if (!v || v.t !== "ARRAY") return v ? v.t : "UNKNOWN";
  return `ARRAY[${v.v.dims.map(([lo, hi]) => `${lo}:${hi}`).join(",")}] OF ${v.v.of}`;
}

function want(v, types, name, diag, pos) {
  if (!v) {
    diag.push(new Diagnostic("E_TYPE_ARG", pos, { name, want: types.join(" or "), got: "nothing" }));
    return false;
  }
  if (!types.includes(v.t)) {
    diag.push(new Diagnostic("E_TYPE_ARG", pos, { name, want: types.join(" or "), got: typeName(v) }));
    return false;
  }
  return true;
}

const charOrString = (d) => (d && d.id === "0478" ? ["CHAR", "STRING"] : ["CHAR"]);

export const BUILTINS = {
  LENGTH: {
    args: () => [["STRING"]],
    returns: "INTEGER",
    signature: "LENGTH(ThisString : STRING) RETURNS INTEGER",
    doc: "the number of characters in a string",
    call: (a) => V("INTEGER", String(a[0].v).length),
  },
  MID: {
    args: () => [["STRING"], ["INTEGER"], ["INTEGER"]],
    returns: "STRING",
    signature: "MID(ThisString : STRING, x : INTEGER, y : INTEGER) RETURNS STRING",
    doc: "y characters starting at position x",
    call: (a, ctx) => substring(a, ctx, "MID"),
  },
  SUBSTRING: {
    args: () => [["STRING"], ["INTEGER"], ["INTEGER"]],
    returns: "STRING",
    signature: "SUBSTRING(ThisString : STRING, start : INTEGER, length : INTEGER) RETURNS STRING",
    doc: "length characters starting at position start",
    call: (a, ctx) => substring(a, ctx, "SUBSTRING"),
  },
  RIGHT: {
    args: () => [["STRING"], ["INTEGER"]],
    returns: "STRING",
    signature: "RIGHT(ThisString : STRING, x : INTEGER) RETURNS STRING",
    doc: "rightmost x characters",
    call: (a) => {
      const s = String(a[0].v);
      const x = a[1].v;
      return V("STRING", x <= 0 ? "" : s.slice(-x));
    },
  },
  LCASE: {
    args: (d) => [charOrString(d)],
    returns: "CHAR",
    signature: "LCASE(ThisChar : CHAR) RETURNS CHAR",
    doc: "the lower-case equivalent",
    call: (a) => V("CHAR", String(a[0].v).toLowerCase()),
  },
  UCASE: {
    args: (d) => [charOrString(d)],
    returns: "CHAR",
    signature: "UCASE(ThisChar : CHAR) RETURNS CHAR",
    doc: "the upper-case equivalent",
    call: (a) => V("CHAR", String(a[0].v).toUpperCase()),
  },
  INT: {
    args: () => [["REAL", "INTEGER"]],
    returns: "INTEGER",
    signature: "INT(x : REAL) RETURNS INTEGER",
    doc: "the integer part of x",
    call: (a) => V("INTEGER", Math.trunc(Number(a[0].v))),
  },
  RAND: {
    args: () => [],
    optionalArgs: () => [["INTEGER", "REAL"]],
    returns: "REAL",
    signature: "RAND(x : INTEGER) RETURNS REAL",
    doc: "a random real from 0 up to but not including x",
    call: (a, ctx) => V("REAL", ctx.random() * (a.length ? Number(a[0].v) : 1)),
  },
  RANDOM: {
    args: () => [],
    returns: "REAL",
    signature: "RANDOM() RETURNS REAL",
    doc: "a random number between 0 and 1 inclusive",
    call: (a, ctx) => V("REAL", ctx.random()),
  },
  ROUND: {
    args: () => [["REAL", "INTEGER"], ["INTEGER"]],
    returns: "REAL",
    signature: "ROUND(x : REAL, places : INTEGER) RETURNS REAL",
    doc: "x rounded to places decimal places",
    call: (a) => {
      const factor = Math.pow(10, Number(a[1].v));
      return V("REAL", Math.round(Number(a[0].v) * factor) / factor);
    },
  },
  MOD: {
    args: () => [["INTEGER"], ["INTEGER"]],
    returns: "INTEGER",
    signature: "MOD(a : INTEGER, b : INTEGER) RETURNS INTEGER",
    doc: "the remainder of a divided by b",
    call: (a, ctx) => {
      if (Number(a[1].v) === 0) {
        ctx.diag.push(new Diagnostic("E_MOD_ZERO", ctx.pos, { line: ctx.pos.line }));
        return V("INTEGER", 0);
      }
      return V("INTEGER", Number(a[0].v) % Number(a[1].v));
    },
  },
  DIV: {
    args: () => [["INTEGER"], ["INTEGER"]],
    returns: "INTEGER",
    signature: "DIV(a : INTEGER, b : INTEGER) RETURNS INTEGER",
    doc: "the quotient of a divided by b, fraction discarded",
    call: (a, ctx) => {
      if (Number(a[1].v) === 0) {
        ctx.diag.push(new Diagnostic("E_DIV_ZERO", ctx.pos, { line: ctx.pos.line }));
        return V("INTEGER", 0);
      }
      return V("INTEGER", Math.trunc(Number(a[0].v) / Number(a[1].v)));
    },
  },
};

function substring(a, ctx, name) {
  const s = String(a[0].v);
  const start = Number(a[1].v);
  const count = Number(a[2].v);
  if (start < 1 || count < 0) {
    ctx.diag.push(new Diagnostic("E_TYPE_ARG", ctx.pos, { name, want: "a start position of 1 or more", got: String(start) }));
    return V("STRING", "");
  }
  return V("STRING", s.slice(start - 1, start - 1 + count));
}

export const BUILTIN_NAMES = Object.keys(BUILTINS);

export function builtinNamesFor(dialect, homeList) {
  return homeList.filter((name) => BUILTINS[name]);
}

export function checkBuiltinCall(name, args, pos, diag, dialect) {
  const fn = BUILTINS[name.toUpperCase()];
  if (!fn) return null;
  const required = fn.args(dialect);
  const optional = fn.optionalArgs ? fn.optionalArgs(dialect) : [];
  const total = required.length + optional.length;
  if (args.length < required.length || args.length > total) {
    diag.push(new Diagnostic("E_ARITY", pos, { name, want: required.length, got: args.length }));
    return fn;
  }
  args.forEach((a, i) => {
    const types = i < required.length ? required[i] : optional[i - required.length];
    want(a, types, name, diag, pos);
  });
  return fn;
}
