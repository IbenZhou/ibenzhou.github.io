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

function want(v, types, name, got, argsIndex, diag, pos) {
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

export const BUILTINS = {
  LENGTH: {
    args: [["STRING"]],
    returns: "INTEGER",
    signature: "LENGTH(ThisString : STRING) RETURNS INTEGER",
    doc: "the number of characters in a string",
    call: (a, ctx) => V("INTEGER", String(a[0].v).length),
  },
  MID: {
    args: [["STRING"], ["INTEGER"], ["INTEGER"]],
    returns: "STRING",
    signature: "MID(ThisString : STRING, x : INTEGER, y : INTEGER) RETURNS STRING",
    doc: "y characters starting at position x",
    call: (a, ctx) => {
      const s = String(a[0].v);
      const x = a[1].v;
      const y = a[2].v;
      if (x < 1 || y < 0) {
        ctx.diag.push(new Diagnostic("E_TYPE_ARG", ctx.pos, { name: "MID", want: "a start position of 1 or more", got: String(x) }));
        return V("STRING", "");
      }
      return V("STRING", s.slice(x - 1, x - 1 + y));
    },
  },
  RIGHT: {
    args: [["STRING"], ["INTEGER"]],
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
    args: [["CHAR"]],
    returns: "CHAR",
    signature: "LCASE(ThisChar : CHAR) RETURNS CHAR",
    doc: "the lower-case equivalent of a character",
    call: (a) => V("CHAR", String(a[0].v).toLowerCase()),
  },
  UCASE: {
    args: [["CHAR"]],
    returns: "CHAR",
    signature: "UCASE(ThisChar : CHAR) RETURNS CHAR",
    doc: "the upper-case equivalent of a character",
    call: (a) => V("CHAR", String(a[0].v).toUpperCase()),
  },
  INT: {
    args: [["REAL", "INTEGER"]],
    returns: "INTEGER",
    signature: "INT(x : REAL) RETURNS INTEGER",
    doc: "the integer part of x",
    call: (a) => V("INTEGER", Math.trunc(Number(a[0].v))),
  },
  RAND: {
    args: [["INTEGER", "REAL"]],
    returns: "REAL",
    signature: "RAND(x : INTEGER) RETURNS REAL",
    doc: "a random real in the range 0 up to but not including x",
    call: (a, ctx) => V("REAL", ctx.random() * Number(a[0].v)),
  },
};

export const BUILTIN_NAMES = Object.keys(BUILTINS);

export function checkBuiltinCall(name, args, pos, diag) {
  const fn = BUILTINS[name.toUpperCase()];
  if (!fn) return null;
  if (args.length !== fn.args.length) {
    diag.push(new Diagnostic("E_ARITY", pos, { name, want: fn.args.length, got: args.length }));
    return fn;
  }
  args.forEach((a, i) => want(a, fn.args[i], name, null, i, diag, pos));
  return fn;
}
