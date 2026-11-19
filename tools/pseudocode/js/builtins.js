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

  LEFT: {
    args: () => [["STRING"], ["INTEGER"]],
    returns: "STRING",
    signature: "LEFT(ThisString : STRING, x : INTEGER) RETURNS STRING",
    doc: "leftmost x characters",
    call: (a) => {
      const s = String(a[0].v);
      const x = Number(a[1].v);
      return V("STRING", x <= 0 ? "" : s.slice(0, x));
    },
  },
  TO_UPPER: {
    args: () => [["CHAR", "STRING"]],
    returns: "CHAR",
    signature: "TO_UPPER(x : CHAR or STRING) RETURNS same type",
    doc: "all characters converted to upper case",
    call: (a) => V(a[0].t, String(a[0].v).toUpperCase()),
  },
  TO_LOWER: {
    args: () => [["CHAR", "STRING"]],
    returns: "CHAR",
    signature: "TO_LOWER(x : CHAR or STRING) RETURNS same type",
    doc: "all characters converted to lower case",
    call: (a) => V(a[0].t, String(a[0].v).toLowerCase()),
  },
  NUM_TO_STR: {
    args: () => [["INTEGER", "REAL"]],
    returns: "STRING",
    signature: "NUM_TO_STR(x : INTEGER or REAL) RETURNS STRING",
    doc: "a string representation of a number, using - for negatives",
    call: (a) => V("STRING", a[0].t === "REAL" ? fmtNumber(Number(a[0].v)) : String(a[0].v)),
  },
  STR_TO_NUM: {
    args: () => [["CHAR", "STRING"]],
    returns: "REAL",
    signature: "STR_TO_NUM(x : CHAR or STRING) RETURNS REAL or INTEGER",
    doc: "a numeric value, whole if the string has no decimal point",
    call: (a, ctx) => {
      const text = String(a[0].v).trim();
      if (!/^-?[0-9]+(\.[0-9]+)?$/.test(text)) {
        ctx.diag.push(new Diagnostic("E_TYPE_ARG", ctx.pos, { name: "STR_TO_NUM", want: "a string that represents a number", got: JSON.stringify(a[0].v) }));
        return V("REAL", 0);
      }
      return text.includes(".") ? V("REAL", parseFloat(text)) : V("INTEGER", parseInt(text, 10));
    },
  },
  IS_NUM: {
    args: () => [["CHAR", "STRING"]],
    returns: "BOOLEAN",
    signature: "IS_NUM(ThisString : CHAR or STRING) RETURNS BOOLEAN",
    doc: "TRUE if the value is a valid number",
    call: (a) => V("BOOLEAN", /^-?[0-9]+(\.[0-9]+)?$/.test(String(a[0].v).trim())),
  },
  ASC: {
    args: () => [["CHAR"]],
    returns: "INTEGER",
    signature: "ASC(ThisChar : CHAR) RETURNS INTEGER",
    doc: "the ASCII value of a character",
    call: (a) => V("INTEGER", String(a[0].v).charCodeAt(0)),
  },
  CHR: {
    args: () => [["INTEGER"]],
    returns: "CHAR",
    signature: "CHR(x : INTEGER) RETURNS CHAR",
    doc: "the character with that ASCII value",
    call: (a, ctx) => {
      const code = Number(a[0].v);
      if (code < 0 || code > 0x10ffff) {
        ctx.diag.push(new Diagnostic("E_TYPE_ARG", ctx.pos, { name: "CHR", want: "a value from 0 to 1114111", got: String(code) }));
        return V("CHAR", " ");
      }
      return V("CHAR", String.fromCharCode(code));
    },
  },
  DAY: {
    args: () => [["DATE"]],
    returns: "INTEGER",
    signature: "DAY(ThisDate : DATE) RETURNS INTEGER",
    doc: "the day number from a date",
    call: (a) => V("INTEGER", a[0].v.day),
  },
  MONTH: {
    args: () => [["DATE"]],
    returns: "INTEGER",
    signature: "MONTH(ThisDate : DATE) RETURNS INTEGER",
    doc: "the month number from a date",
    call: (a) => V("INTEGER", a[0].v.month),
  },
  YEAR: {
    args: () => [["DATE"]],
    returns: "INTEGER",
    signature: "YEAR(ThisDate : DATE) RETURNS INTEGER",
    doc: "the year number from a date",
    call: (a) => V("INTEGER", a[0].v.year),
  },
  DAYINDEX: {
    args: () => [["DATE"]],
    returns: "INTEGER",
    signature: "DAYINDEX(ThisDate : DATE) RETURNS INTEGER",
    doc: "Sunday = 1, Monday = 2, and so on",
    call: (a) => {
      const { day, month, year } = a[0].v;
      return V("INTEGER", new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 1);
    },
  },
  SETDATE: {
    args: () => [["INTEGER"], ["INTEGER"], ["INTEGER"]],
    returns: "DATE",
    signature: "SETDATE(Day, Month, Year : INTEGER) RETURNS DATE",
    doc: "a date value built from three integers",
    call: (a, ctx) => {
      const day = Number(a[0].v);
      const month = Number(a[1].v);
      const year = Number(a[2].v);
      if (!validDate(day, month, year)) {
        ctx.diag.push(new Diagnostic("E_TYPE_ARG", ctx.pos, { name: "SETDATE", want: "a real calendar date", got: `${day}/${month}/${year}` }));
        return V("DATE", { day: 1, month: 1, year: 1900 });
      }
      return V("DATE", { day, month, year });
    },
  },
  TODAY: {
    args: () => [],
    returns: "DATE",
    signature: "TODAY() RETURNS DATE",
    doc: "the current date",
    call: (a, ctx) => {
      const now = new Date(ctx.now ? ctx.now() : Date.now());
      return V("DATE", { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() });
    },
  },
};

function validDate(day, month, year) {
  if (month < 1 || month > 12 || day < 1 || year < 1000) return false;
  const lengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  if (leap) lengths[1] = 29;
  return day <= lengths[month - 1];
}

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
