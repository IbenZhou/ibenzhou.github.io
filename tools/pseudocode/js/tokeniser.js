import { CODES } from "./diagnostics.js";

export const KEYWORDS = new Set([
  "DECLARE", "CONSTANT", "ARRAY", "OF",
  "INTEGER", "REAL", "CHAR", "STRING", "BOOLEAN", "DATE",
  "IF", "THEN", "ELSE", "ENDIF",
  "CASE", "OTHERWISE", "ENDCASE",
  "FOR", "TO", "STEP", "NEXT",
  "WHILE", "DO", "ENDWHILE", "REPEAT", "UNTIL",
  "PROCEDURE", "ENDPROCEDURE", "FUNCTION", "ENDFUNCTION", "RETURNS", "RETURN", "CALL",
  "OUTPUT", "INPUT",
  "BYREF", "BYVAL",
  "AND", "OR", "NOT", "MOD", "DIV",
  "TRUE", "FALSE",
]);

export const NOT_IN_V1 = new Set([
  "TYPE", "ENDTYPE", "CLASS", "ENDCLASS", "PUBLIC", "PRIVATE", "INHERITS", "SUPER", "NEW",
  "OPENFILE", "CLOSEFILE", "READFILE", "WRITEFILE", "SEEK", "GETRECORD", "PUTRECORD",
  "APPEND", "EOF", "SET", "DEFINE",
]);

export const ALEVEL_ONLY = new Set([
  "TYPE", "ENDTYPE", "CLASS", "ENDCLASS", "PUBLIC", "PRIVATE", "INHERITS", "SUPER", "NEW", "SET", "DEFINE",
]);

export const DATA_TYPES = new Set(["INTEGER", "REAL", "CHAR", "STRING", "BOOLEAN", "DATE"]);

const WORD = /^[A-Za-z][A-Za-z0-9_]*/;
const INT_LIT = /^[0-9]+/;
const REAL_LIT = /^[0-9]+\.[0-9]+/;
const DATE_LIT = /^([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4})/;
const CHAR_LIT = /^'([^']*)'/;
const STR_LIT = /^"((?:[^"\\]|\\.)*)"/;
const PUNCT = /^[()\[\],:.]/;
const OPERATOR = /^(<=|>=|<>|!=|<-|\u2190|\*\*|[-+*/&%=^#<>])/;

const CANON_ASSIGN = ["<-", "\u2190"];

function unescape(s) {
  return s.replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, "\n").replace(/\\t/g, "\t");
}

function validDate(day, month, year) {
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1000) return false;
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  if (leap) days[1] = 29;
  return day <= days[month - 1];
}

export class Diagnostic {
  constructor(code, pos, ctx = {}, fix = null) {
    this.code = code;
    this.level = CODES[code] && code.startsWith("E_") ? "error" : "note";
    this.pos = pos;
    this.ctx = ctx;
    this.fix = fix;
  }
}

function cut(src) {
  let inStr = null;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      if (ch === "\\") i++;
      else if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'") { inStr = ch; continue; }
    if (ch === "/" && src[i + 1] === "/") return [src.slice(0, i), src.slice(i + 2)];
  }
  return [src, null];
}

export function tokenise(text, dialect) {
  const d = dialect || { id: "9618", underscoreInNames: true, pascalStartNames: "silent", caretIsPointer: true };
  const lines = [];
  const errors = [];
  const pragmas = {};
  const notedPascal = new Set();

  text.split(/\r\n|\r|\n/).forEach((raw, index) => {
    const lineNo = index + 1;
    const [codePart, comment] = cut(raw);
    if (comment) {
      const m = /^\s*SET_MAX_STEPS\s*=\s*([0-9]+)/i.exec(comment);
      if (m) pragmas.maxSteps = parseInt(m[1], 10);
    }
    const tokens = [];
    let src = codePart;
    let col = 1;

    const push = (type, value, length, extra) => {
      tokens.push({ type, value, line: lineNo, col, end: col + length - 1, ...extra });
      col += length;
      src = src.slice(length);
    };

    while (src.length) {
      const ws = /^[ \t]+/.exec(src);
      if (ws) { col += ws[0].length; src = src.slice(ws[0].length); continue; }

      const word = WORD.exec(src);
      if (word) {
        const raw2 = word[0];
        const upper = raw2.toUpperCase();
        if (KEYWORDS.has(upper)) {
          if (raw2 !== upper) {
            errors.push(new Diagnostic("E_KEYWORD_CASE", { line: lineNo, col }, { kw: upper }));
          }
          push("KEY", upper, raw2.length, { raw: raw2 });
        } else {
          if (!d.underscoreInNames && raw2.includes("_")) {
            errors.push(new Diagnostic("E_IGCSE_UNDERSCORE", { line: lineNo, col }, {
              name: raw2,
              fixed: raw2.replace(/_+([a-z])/g, (m, ch) => ch.toUpperCase()).replace(/_+/g, ""),
            }));
          } else if (d.pascalStartNames === "note" && raw2.length > 1 && /^[a-z]/.test(raw2) && !notedPascal.has(upper)) {
            notedPascal.add(upper);
            errors.push(new Diagnostic("W_IGCSE_PASCAL", { line: lineNo, col }, {
              name: raw2,
              fixed: raw2.charAt(0).toUpperCase() + raw2.slice(1),
            }));
          }
          push("IDENT", raw2, raw2.length);
        }
        continue;
      }

      const date = DATE_LIT.exec(src);
      if (date) {
        const [, dd, mm, yyyy] = date.map(Number);
        if (!validDate(dd, mm, yyyy)) {
          errors.push(new Diagnostic("E_BAD_DATE", { line: lineNo, col }, { text: date[0] }));
        }
        push("DATE", { day: dd, month: mm, year: yyyy }, date[0].length);
        continue;
      }

      const real = REAL_LIT.exec(src);
      if (real) { push("REAL", parseFloat(real[0]), real[0].length); continue; }

      const int = INT_LIT.exec(src);
      if (int) {
        const longer = /^[0-9]+\./.exec(src);
        if (longer) {
          errors.push(new Diagnostic("E_BAD_REAL", { line: lineNo, col }, { text: "0.5" }));
          push("REAL", parseFloat(src.match(/^[0-9]+\./)[0]), longer[0].length);
          continue;
        }
        push("INT", parseInt(int[0], 10), int[0].length);
        continue;
      }

      if (src[0] === "." && /^[0-9]/.test(src.slice(1))) {
        errors.push(new Diagnostic("E_BAD_REAL", { line: lineNo, col }, { text: "0.5" }));
        const m = /^\.[0-9]+/.exec(src);
        push("REAL", parseFloat(m[0]), m[0].length);
        continue;
      }

      if (src[0] === '"' || src[0] === "'") {
        const quote = src[0];
        const body = quote === '"' ? STR_LIT.exec(src) : CHAR_LIT.exec(src);
        if (!body) {
          errors.push(new Diagnostic("E_UNTERMINATED_STRING", { line: lineNo, col }, {}));
          push(quote === '"' ? "STR" : "CHAR", unescape(src.slice(1)), src.length);
          continue;
        }
        const inner = body[1];
        if (quote === "'") {
          if (inner.length === 1) push("CHAR", inner, body[0].length);
          else if (inner.length === 0) {
            errors.push(new Diagnostic("E_BAD_CHAR", { line: lineNo, col }, { text: "''" }));
            push("CHAR", "", body[0].length);
          } else {
            errors.push(new Diagnostic("E_DOUBLE_QUOTE_CHAR", { line: lineNo, col }, { text: body[0] }));
            push("STR", unescape(inner), body[0].length);
          }
        } else {
          push("STR", unescape(inner), body[0].length);
        }
        continue;
      }

      const op = OPERATOR.exec(src);
      if (op) {
        const o = op[0];
        if (o === "!=") {
          errors.push(new Diagnostic("E_NOT_EQUALS", { line: lineNo, col }, {}));
          push("OP", "<>", 2);
          continue;
        }
        if (o === "%") {
          errors.push(new Diagnostic("E_MOD_PERCENT", { line: lineNo, col }, {}));
          col += 1; src = src.slice(1);
          continue;
        }
        if (o === "#") {
          errors.push(new Diagnostic("E_COMMENT_HASH", { line: lineNo, col }, {}));
          col += 1; src = src.slice(1);
          continue;
        }
        if (o === "^" && !d.caretIsPointer) {
          push("OP", "^", 1);
          continue;
        }
        if (o === "**" || o === "^") {
          errors.push(new Diagnostic(d.caretIsPointer ? "E_POWER" : "E_IGCSE_POWER_CARET", { line: lineNo, col }, { op: o }));
          push("OP", "POW", o.length);
          continue;
        }
        push("OP", o, o.length, { canon: CANON_ASSIGN.includes(o) });
        continue;
      }

      const punct = PUNCT.exec(src);
      if (punct) { push("PUNCT", punct[0], 1); continue; }

      if (src[0] === "\u2265" || src[0] === "\u2264") {
        push("OP", src[0] === "\u2265" ? ">=" : "<=", 1);
        continue;
      }

      errors.push(new Diagnostic("E_UNEXPECTED", { line: lineNo, col }, { what: JSON.stringify(src[0]) }));
      col += 1; src = src.slice(1);
    }

    tokens.push({ type: "EOL", value: "\n", line: lineNo, col, end: col });
    lines.push({ lineNo, raw, tokens, comment, blank: tokens.length === 1 });
  });

  return { lines, errors, pragmas };
}
