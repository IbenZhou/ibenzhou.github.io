import { NOT_IN_V1, ALEVEL_ONLY, DATA_TYPES, Diagnostic } from "./tokeniser.js";

const BLOCK_OPEN = {
  IF: "ENDIF",
  PROCEDURE: "ENDPROCEDURE",
  FUNCTION: "ENDFUNCTION",
  FOR: "NEXT",
  WHILE: "ENDWHILE",
  REPEAT: "UNTIL",
  CASE: "ENDCASE",
};

function firstToken(line) {
  return line ? line.tokens[0] : undefined;
}

function isKey(tok, value) {
  return tok && tok.type === "KEY" && tok.value === value;
}

export function parse(tok, dialect) {
  const d = dialect || { id: "9618", hasDate: true, hasByRef: true, hasCaseRanges: true, whileDo: "note", callParens: "required", constantForm: "equals", thenOwnLine: "note", caseRanges: true };
  const lines = tok.lines;
  const diagnostics = [...tok.errors];
  let li = 0;
  let ci = 0;

  const err = (code, pos, ctx, fix) => diagnostics.push(new Diagnostic(code, pos, ctx, fix));
  const peek = () => lines[li] && lines[li].tokens[ci];
  const atEol = () => !lines[li] || lines[li].tokens[ci].type === "EOL";
  const next = () => (lines[li] ? lines[li].tokens[ci++] : { type: "EOL", line: lines.length, col: 1 });
  const here = () => (lines[li] ? lines[li].tokens[ci] : { line: lines.length, col: 1 });
  const posOf = (t) => ({ line: t.line, col: t.col });
  const advanceLine = () => { li += 1; ci = 0; };
  const skipBlank = () => { while (lines[li] && lines[li].blank) advanceLine(); };

  const eatKey = (value) => (isKey(peek(), value) ? (next(), true) : false);

  function expectKey(value) {
    if (isKey(peek(), value)) return next();
    const t = here();
    err("E_UNEXPECTED", posOf(t), { what: `expected ${value}` });
    return null;
  }

  function expectPunct(value) {
    const t = peek();
    if (t && t.type === "PUNCT" && t.value === value) return next();
    err("E_UNEXPECTED", posOf(here()), { what: `expected '${value}'` });
    return null;
  }

  function eatPunct(value) {
    const t = peek();
    if (t && t.type === "PUNCT" && t.value === value) { next(); return true; }
    return false;
  }

  function expectIdent(why) {
    const t = peek();
    if (t && t.type === "IDENT") { next(); return t; }
    if (t && t.type === "KEY") err("E_RESERVED", posOf(t), { name: t.value });
    else err("E_UNEXPECTED", posOf(here()), { what: why || "a name" });
    return null;
  }

  function restOfLineIsClean(statementPos) {
    if (atEol()) return;
    const t = here();
    err("E_STATEMENT_AFTER", statementPos || posOf(t), {
      kw: t.type === "KEY" ? t.value : "",
      after: lines[li].tokens.slice(ci).filter((x) => x.type !== "EOL").map((x) => x.value).join(" "),
    });
  }

  function finishLine(statementPos) {
    restOfLineIsClean(statementPos);
    advanceLine();
  }

  function lineStartsWith(...keys) {
    const t = firstToken(lines[li]);
    return !!t && t.type === "KEY" && keys.includes(t.value);
  }

  function deferred(t) {
    return !!t && t.type === "IDENT" && NOT_IN_V1.has(t.value.toUpperCase());
  }

  function deferredCode(word) {
    return d.id === "0478" && ALEVEL_ONLY.has(word) ? "E_IGCSE_NOT_IN_SYLLABUS" : "E_UNSUPPORTED";
  }

  const DEFERRED_BLOCKS = { TYPE: "ENDTYPE", CLASS: "ENDCLASS" };

  function skipDeferredBlock(word) {
    const closer = DEFERRED_BLOCKS[word];
    advanceLine();
    if (!closer) return;
    while (li < lines.length) {
      const first = firstToken(lines[li]);
      const isCloser = !!first && String(first.value).toUpperCase() === closer;
      if (isCloser) { advanceLine(); return; }
      if (first && first.type === "KEY" && closer === "ENDTYPE" && first.value === "ENDTYPE") { advanceLine(); return; }
      advanceLine();
    }
  }

  // ---------------------------------------------------------------- expressions

  function parseExpression() {
    return parseOr();
  }

  function parseOr() {
    let left = parseAnd();
    while (isKey(peek(), "OR")) {
      const op = next();
      left = { k: "bin", op: "OR", l: left, r: parseAnd(), pos: posOf(op) };
    }
    return left;
  }

  function parseAnd() {
    let left = parseNot();
    while (isKey(peek(), "AND")) {
      const op = next();
      left = { k: "bin", op: "AND", l: left, r: parseNot(), pos: posOf(op) };
    }
    return left;
  }

  function parseNot() {
    if (isKey(peek(), "NOT")) {
      const op = next();
      return { k: "un", op: "NOT", e: parseNot(), pos: posOf(op) };
    }
    return parseCompare();
  }

  const CMP = ["=", "<>", "<", ">", "<=", ">="];

  function parseCompare() {
    let left = parseConcat();
    while (peek() && peek().type === "OP" && CMP.includes(peek().value)) {
      const op = next();
      left = { k: "bin", op: op.value, l: left, r: parseConcat(), pos: posOf(op) };
    }
    return left;
  }

  function parseConcat() {
    let left = parseAdd();
    while (peek() && peek().type === "OP" && peek().value === "&") {
      const op = next();
      left = { k: "bin", op: "&", l: left, r: parseAdd(), pos: posOf(op) };
    }
    return left;
  }

  function parseAdd() {
    let left = parseMul();
    while (peek() && peek().type === "OP" && (peek().value === "+" || peek().value === "-")) {
      const op = next();
      left = { k: "bin", op: op.value, l: left, r: parseMul(), pos: posOf(op) };
    }
    return left;
  }

  function parseMul() {
    let left = parseUnary();
    for (;;) {
      const t = peek();
      if (!t) break;
      let op = null;
      if (t.type === "OP" && (t.value === "*" || t.value === "/")) op = t.value;
      else if (t.type === "OP" && (t.value === "^" || t.value === "POW")) op = "^";
      else if (t.type === "KEY" && (t.value === "MOD" || t.value === "DIV")) op = t.value;
      if (!op) break;
      next();
      if (d.id === "0478" && (op === "MOD" || op === "DIV")) {
        err("W_IGCSE_INFIX_MOD", posOf(t), { alt: `${op}(a, b)` });
      }
      left = { k: "bin", op, l: left, r: parseUnary(), pos: posOf(t) };
    }
    return left;
  }

  function parseUnary() {
    const t = peek();
    if (t && t.type === "OP" && (t.value === "-" || t.value === "+")) {
      next();
      return { k: "un", op: t.value, e: parseUnary(), pos: posOf(t) };
    }
    return parsePrimary();
  }

  function parseArgs(closing = ")") {
    const args = [];
    if (eatPunct(closing)) return args;
    for (;;) {
      args.push(parseExpression());
      if (eatPunct(",")) continue;
      expectPunct(closing);
      break;
    }
    return args;
  }

  function parsePrimary() {
    const t = peek();
    if (!t || t.type === "EOL") {
      err("E_UNEXPECTED", posOf(here()), { what: "a value" });
      return { k: "num", v: 0, t: "INTEGER", pos: posOf(here()) };
    }
    if (t.type === "INT") { next(); return { k: "num", v: t.value, t: "INTEGER", pos: posOf(t) }; }
    if (t.type === "REAL") { next(); return { k: "num", v: t.value, t: "REAL", pos: posOf(t) }; }
    if (t.type === "STR") { next(); return { k: "str", v: t.value, pos: posOf(t) }; }
    if (t.type === "CHAR") { next(); return { k: "char", v: t.value, pos: posOf(t) }; }
    if (t.type === "DATE") { next(); return { k: "date", v: t.value, pos: posOf(t) }; }
    if (t.type === "KEY" && (t.value === "TRUE" || t.value === "FALSE")) {
      next();
      return { k: "bool", v: t.value === "TRUE", pos: posOf(t) };
    }
    if (t.type === "KEY" && (t.value === "MOD" || t.value === "DIV")) {
      const after = lines[li].tokens[ci + 1];
      if (after && after.type === "PUNCT" && after.value === "(") {
        next();
        next();
        return { k: "call", name: t.value, args: parseArgs(), pos: posOf(t) };
      }
    }
    if (t.type === "PUNCT" && t.value === "(") {
      next();
      const inner = parseExpression();
      expectPunct(")");
      return inner;
    }
    if (deferred(t)) {
      const word = t.value.toUpperCase();
      err(deferredCode(word), posOf(t), { kw: word });
      next();
      return { k: "num", v: 0, t: "INTEGER", pos: posOf(t) };
    }
    if (t.type === "IDENT") {
      next();
      const after = peek();
      if (after && after.type === "PUNCT" && after.value === "(") {
        next();
        return { k: "call", name: t.value, args: parseArgs(), pos: posOf(t) };
      }
      if (after && after.type === "PUNCT" && after.value === "[") {
        return { k: "index", name: t.value, dims: parseDims(), pos: posOf(t) };
      }
      return { k: "var", name: t.value, pos: posOf(t) };
    }
    if (t.type === "KEY" && DATA_TYPES.has(t.value)) {
      err("E_UNEXPECTED", posOf(t), { what: `'${t.value}' is a type name, not a value` });
      next();
      return { k: "num", v: 0, t: "INTEGER", pos: posOf(t) };
    }
    if (t.type === "UNSUPPORTED") {
      err("E_UNSUPPORTED", posOf(t), { kw: t.value });
      next();
      return { k: "num", v: 0, t: "INTEGER", pos: posOf(t) };
    }
    err("E_UNEXPECTED", posOf(t), { what: JSON.stringify(String(t.value)) });
    next();
    return { k: "num", v: 0, t: "INTEGER", pos: posOf(t) };
  }

  function parseDims() {
    const dims = [];
    expectPunct("[");
    for (;;) {
      dims.push(parseExpression());
      if (eatPunct(",")) continue;
      expectPunct("]");
      break;
    }
    return dims;
  }

  // ---------------------------------------------------------------- targets

  function parseTarget() {
    const t = peek();
    if (t && t.type === "IDENT") {
      next();
      if (peek() && peek().type === "PUNCT" && peek().value === "[") {
        return { k: "index", name: t.value, dims: parseDims(), pos: posOf(t) };
      }
      return { k: "var", name: t.value, pos: posOf(t) };
    }
    err("E_UNEXPECTED", posOf(here()), { what: "a variable to store the value in" });
    return null;
  }

  // ---------------------------------------------------------------- statements

  function parseDeclare() {
    const start = posOf(next());
    const items = [];
    for (;;) {
      const nameTok = expectIdent("a variable name");
      if (!nameTok) break;
      if (eatPunct(",")) {
        err("W_MULTI_DECLARE", start, {});
        continue;
      }
      expectPunct(":");
      const item = parseTypeOf(nameTok);
      items.push(item);
      break;
    }
    finishLine(start);
    return { k: "declare", items, pos: start };
  }

  function parseTypeOf(nameTok) {
    const t = peek();
    if (t && t.type === "KEY" && t.value === "ARRAY") {
      next();
      expectPunct("[");
      const bounds = [];
      for (;;) {
        const lo = parseExpression();
        expectPunct(":");
        const hi = parseExpression();
        bounds.push([lo, hi]);
        if (eatPunct(",")) continue;
        expectPunct("]");
        break;
      }
      if (!eatKey("OF")) err("E_BAD_ARRAY", posOf(nameTok), {});
      const ofTok = peek();
      if (ofTok && ofTok.type === "KEY" && DATA_TYPES.has(ofTok.value)) {
        next();
        if (ofTok.value === "DATE" && !d.hasDate) err("E_IGCSE_NO_DATE", posOf(ofTok), {});
        return { name: nameTok.value, type: "ARRAY", of: ofTok.value, bounds, pos: posOf(nameTok) };
      }
      if (ofTok && ofTok.type === "IDENT") {
        err("E_UNSUPPORTED", posOf(ofTok), { kw: `records (${ofTok.value})` });
        next();
        return { name: nameTok.value, type: "ARRAY", of: "UNSUPPORTED", bounds, pos: posOf(nameTok) };
      }
      err("E_BAD_ARRAY", posOf(here()), {});
      return { name: nameTok.value, type: "ARRAY", of: "INTEGER", bounds, pos: posOf(nameTok) };
    }
    if (t && t.type === "KEY" && DATA_TYPES.has(t.value)) {
      next();
      if (t.value === "DATE" && !d.hasDate) err("E_IGCSE_NO_DATE", posOf(t), {});
      return { name: nameTok.value, type: t.value, pos: posOf(nameTok) };
    }
    if (t && t.type === "IDENT") {
      err("E_UNSUPPORTED", posOf(t), { kw: `user-defined types (${t.value})` });
      next();
      return { name: nameTok.value, type: "UNSUPPORTED", pos: posOf(nameTok) };
    }
    err("E_BAD_DECLARE", posOf(here()), {});
    return { name: nameTok.value, type: "INTEGER", pos: posOf(nameTok) };
  }

  function parseConstant() {
    const start = posOf(next());
    const nameTok = expectIdent("a constant name");
    const opTok = peek();
    if (opTok && opTok.type === "OP" && (opTok.value === "=" || opTok.canon)) {
      next();
      const usedArrow = Boolean(opTok.canon);
      if (d.constantForm === "equals" && usedArrow) err("W_ALEVEL_CONSTANT_ARROW", posOf(opTok), {});
      if (d.constantForm === "arrow" && !usedArrow) err("W_IGCSE_CONSTANT_EQUALS", posOf(opTok), {});
    } else {
      err("E_BAD_CONSTANT", posOf(here()), {});
    }
    const value = parseLiteralOnly();
    finishLine(start);
    return { k: "constant", name: nameTok && nameTok.value, value, pos: start };
  }

  function parseLiteralOnly() {
    const t = peek();
    const ok = t && ["INT", "REAL", "STR", "CHAR", "DATE"].includes(t.type);
    if (ok) {
      next();
      if (t.type === "INT") return { k: "num", v: t.value, t: "INTEGER", pos: posOf(t) };
      if (t.type === "REAL") return { k: "num", v: t.value, t: "REAL", pos: posOf(t) };
      if (t.type === "DATE") return { k: "date", v: t.value, pos: posOf(t) };
      return { k: t.type === "CHAR" ? "char" : "str", v: t.value, pos: posOf(t) };
    }
    if (isKey(t, "TRUE") || isKey(t, "FALSE")) {
      next();
      return { k: "bool", v: t.value === "TRUE", pos: posOf(t) };
    }
    err("E_BAD_CONSTANT", posOf(here()), {});
    return { k: "num", v: 0, t: "INTEGER", pos: posOf(here()) };
  }

  function parseAssignOrCall() {
    const nameTok = next();
    const start = posOf(nameTok);
    let target = { k: "var", name: nameTok.value, pos: start };
    if (peek() && peek().type === "PUNCT" && peek().value === "[") {
      target = { k: "index", name: nameTok.value, dims: parseDims(), pos: start };
    } else if (peek() && peek().type === "PUNCT" && peek().value === "(") {
      next();
      const args = parseArgs();
      err("E_NEEDS_CALL", start, { name: nameTok.value });
      finishLine(start);
      return { k: "call", name: nameTok.value, args, pos: start, bare: true };
    }

    const op = peek();
    if (op && op.type === "OP" && op.value === "=") err("E_ASSIGN_EQUALS", posOf(op), {});
    if (!op || (op.type !== "OP") || !(op.canon || op.value === "=")) {
      err("E_UNEXPECTED", posOf(here()), { what: "an assignment '<-'" });
      finishLine(start);
      return { k: "assign", target, expr: null, pos: start };
    }
    next();
    const expr = parseExpression();
    finishLine(start);
    return { k: "assign", target, expr, pos: start };
  }

  function parseOutput() {
    const start = posOf(next());
    const exprs = [];
    if (atEol()) err("E_UNEXPECTED", start, { what: "something to output" });
    for (;;) {
      exprs.push(parseExpression());
      if (eatPunct(",")) continue;
      break;
    }
    finishLine(start);
    return { k: "output", exprs, pos: start };
  }

  function parseInput() {
    const start = posOf(next());
    const target = parseTarget();
    finishLine(start);
    return { k: "input", target, pos: start };
  }

  function parseIf() {
    const start = posOf(next());
    const cond = parseExpression();
    if (eatKey("THEN")) {
      restOfLineIsClean(start);
    } else if (atEol() && lines[li + 1] && firstToken(lines[li + 1]) && isKey(firstToken(lines[li + 1]), "THEN")) {
      advanceLine();
      next();
      if (d.thenOwnLine === "note") err("W_ALEVEL_THEN_LINE", start, {});
      restOfLineIsClean(start);
    } else {
      err("E_MISSING_THEN", start, {});
    }
    advanceLine();
    const thenBody = parseBody(["ELSE", "ENDIF"]);
    let elseBody = null;
    if (lineStartsWith("ELSE")) {
      const elsePos = posOf(firstToken(lines[li]));
      next();
      if (isKey(peek(), "IF")) {
        err("W_ELSEIF", elsePos, {});
      } else {
        restOfLineIsClean(elsePos);
        advanceLine();
      }
      elseBody = parseBody(["ENDIF"]);
    }
    if (lineStartsWith("ENDIF")) advanceLine();
    else err("E_MISSING_END", start, { open: "IF", close: "ENDIF", line: start.line });
    return { k: "if", cond, then: thenBody, else: elseBody, pos: start };
  }

  function looksLikeCaseLabel() {
    const toks = lines[li] ? lines[li].tokens : [];
    if (!toks.length || toks[0].type === "EOL") return false;
    if (toks[0].type === "KEY" && (toks[0].value === "ENDCASE" || toks[0].value === "OTHERWISE")) return true;
    let depth = 0;
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      if (t.type === "PUNCT" && (t.value === "(" || t.value === "[")) depth++;
      if (t.type === "PUNCT" && (t.value === ")" || t.value === "]")) depth--;
      if (t.type === "PUNCT" && t.value === ":" && depth === 0) return true;
      if (t.type === "OP" && t.canon) return false;
      if (t.type === "KEY" && ["THEN", "DO"].includes(t.value)) return false;
    }
    return false;
  }

  function parseCase() {
    const start = posOf(next());
    if (!eatKey("OF")) err("E_MISSING_OF", start, {});
    const subject = parseExpression();
    restOfLineIsClean(start);
    advanceLine();

    const arms = [];
    let otherwise = null;
    let sawOtherwise = false;

    while (li < lines.length && !lineStartsWith("ENDCASE")) {
      if (lines[li].blank) { advanceLine(); continue; }
      if (lineStartsWith("OTHERWISE")) {
        const labelPos = posOf(firstToken(lines[li]));
        next();
        eatPunct(":");
        const body = [];
        if (!atEol()) body.push(parseStatement());
        else { advanceLine(); body.push(...parseCaseBody()); }
        otherwise = body;
        sawOtherwise = true;
        continue;
      }
      if (!looksLikeCaseLabel()) {
        err("E_UNEXPECTED", posOf(firstToken(lines[li])), { what: "a CASE label" });
        advanceLine();
        continue;
      }
      const labelPos = posOf(firstToken(lines[li]));
      const values = parseCaseValues(labelPos);
      if (sawOtherwise) err("E_CASE_AFTER_OTHERWISE", labelPos, {});
      const body = [];
      if (eatPunct(":")) {
        if (!atEol()) body.push(parseStatement());
        else { advanceLine(); body.push(...parseCaseBody()); }
      } else {
        err("E_MISSING_COLON", labelPos, { text: lines[li] ? lines[li].raw.trim().slice(0, 20) : "" });
        advanceLine();
        body.push(...parseCaseBody());
      }
      arms.push({ values, body, pos: labelPos });
    }
    if (lineStartsWith("ENDCASE")) advanceLine();
    else err("E_MISSING_END", start, { open: "CASE", close: "ENDCASE", line: start.line });
    return { k: "case", subject, arms, otherwise, pos: start };
  }

  function atEolOfLine() {
    const toks = lines[li] ? lines[li].tokens : [];
    return toks.length - 1 === ci || ci >= toks.length;
  }

  function parseCaseValues(labelPos) {
    const values = [];
    for (;;) {
      const lo = parseCaseLiteral(labelPos);
      let hi = null;
      if (isKey(peek(), "TO")) {
        next();
        hi = parseCaseLiteral(labelPos);
        if (!d.caseRanges) err("W_IGCSE_CASE_RANGE", labelPos, {});
      }
      values.push({ lo, hi });
      if (eatPunct(",")) continue;
      break;
    }
    return values;
  }

  function parseCaseLiteral(labelPos) {
    const t = peek();
    const ok = t && (["INT", "REAL", "STR", "CHAR", "DATE"].includes(t.type) ||
      (t.type === "KEY" && (t.value === "TRUE" || t.value === "FALSE")));
    if (!ok) {
      err("E_BAD_CASE_LABEL", posOf(t || here()), { text: t ? String(t.value) : "" });
      if (t) next();
      return { k: "num", v: 0, t: "INTEGER", pos: labelPos };
    }
    next();
    if (t.type === "INT") return { k: "num", v: t.value, t: "INTEGER", pos: posOf(t) };
    if (t.type === "REAL") return { k: "num", v: t.value, t: "REAL", pos: posOf(t) };
    if (t.type === "DATE") return { k: "date", v: t.value, pos: posOf(t) };
    if (t.type === "KEY") return { k: "bool", v: t.value === "TRUE", pos: posOf(t) };
    return { k: t.type === "CHAR" ? "char" : "str", v: t.value, pos: posOf(t) };
  }

  function parseCaseBody() {
    const body = [];
    while (li < lines.length && !lineStartsWith("ENDCASE") && !looksLikeCaseLabel()) {
      if (lines[li].blank) { advanceLine(); continue; }
      body.push(parseStatement());
    }
    return body;
  }

  function parseFor() {
    const start = posOf(next());
    const varTok = expectIdent("a loop variable");
    const op = peek();
    if (op && op.type === "OP" && op.canon) next();
    else err("E_UNEXPECTED", posOf(here()), { what: "'<-' after the loop variable" });
    const from = parseExpression();
    if (!eatKey("TO")) err("E_UNEXPECTED", posOf(here()), { what: "'TO' the end value" });
    const to = parseExpression();
    let step = null;
    if (eatKey("STEP")) {
      step = parseExpression();
      if (step.k === "num" && step.v === 0) err("E_STEP_ZERO", start, {});
    }
    restOfLineIsClean(start);
    advanceLine();
    const body = parseBody(["NEXT"]);
    let nextName = null;
    if (lineStartsWith("NEXT")) {
      const nextPos = posOf(firstToken(lines[li]));
      next();
      const t = peek();
      if (t && t.type === "IDENT") { nextName = t.value; next(); }
      else err("W_NEXT_IDENT", nextPos, {});
      if (varTok && nextName && nextName.toUpperCase() !== varTok.value.toUpperCase()) {
        err("E_NEXT_VAR", nextPos, { open: varTok.value, found: nextName });
      }
      finishLine(nextPos);
    } else {
      err("E_MISSING_END", start, { open: "FOR", close: "NEXT", line: start.line });
    }
    return { k: "for", var: varTok && varTok.value, from, to, step, body, pos: start };
  }

  function parseWhile() {
    const start = posOf(next());
    const cond = parseExpression();
    if (isKey(peek(), "DO")) {
      const doTok = next();
      if (d.whileDo === "note") err("W_ALEVEL_WHILE_DO", posOf(doTok), {});
    } else if (d.whileDo === "required") {
      err("W_IGCSE_WHILE_DO", start, {});
    }
    restOfLineIsClean(start);
    advanceLine();
    const body = parseBody(["ENDWHILE"]);
    if (lineStartsWith("ENDWHILE")) advanceLine();
    else err("E_MISSING_END", start, { open: "WHILE", close: "ENDWHILE", line: start.line });
    return { k: "while", cond, body, pos: start };
  }

  function parseRepeat() {
    const start = posOf(next());
    restOfLineIsClean(start);
    advanceLine();
    const body = parseBody(["UNTIL"]);
    let cond = { k: "bool", v: true, pos: start };
    if (lineStartsWith("UNTIL")) {
      const p = posOf(next());
      cond = parseExpression();
      finishLine(p);
    } else {
      err("E_MISSING_END", start, { open: "REPEAT", close: "UNTIL", line: start.line });
    }
    return { k: "repeat", body, cond, pos: start };
  }

  function parseParams() {
    const params = [];
    let byref = false;
    if (eatPunct(")")) return params;
    for (;;) {
      const refTok = isKey(peek(), "BYREF") || isKey(peek(), "BYVAL") ? peek() : null;
      if (refTok) {
        next();
        byref = refTok.value === "BYREF";
        if (!d.hasByRef) {
          err("E_IGCSE_NO_BYREF", posOf(refTok), { kw: refTok.value });
          byref = false;
        }
      }
      const nameTok = expectIdent("a parameter name");
      if (!nameTok) break;
      let type = null;
      if (eatPunct(":")) {
        const t = peek();
        if (t && t.type === "KEY" && DATA_TYPES.has(t.value)) { next(); type = t.value; }
        else if (t && (t.type === "IDENT" || t.type === "UNSUPPORTED")) {
          err("E_UNSUPPORTED", posOf(t), { kw: `user-defined types (${t.value})` });
          next();
          type = "UNSUPPORTED";
        } else err("E_BAD_PARAM", posOf(here()), { name: nameTok.value });
      } else {
        err("E_BAD_PARAM", posOf(nameTok), { name: nameTok.value });
      }
      params.push({ name: nameTok.value, type, byref });
      if (eatPunct(",")) continue;
      expectPunct(")");
      break;
    }
    return params;
  }

  function parseRoutine(isFunction) {
    const start = posOf(next());
    const nameTok = expectIdent("a routine name");
    let params = [];
    if (eatPunct("(")) params = parseParams();
    else if (d.callParens !== "optional") err("E_UNEXPECTED", posOf(here()), { what: "'(' after the routine name" });

    let retType = null;
    if (isFunction) {
      if (eatKey("RETURNS")) {
        const t = peek();
        if (t && t.type === "KEY" && DATA_TYPES.has(t.value)) { next(); retType = t.value; }
        else if (t && (t.type === "IDENT" || t.type === "UNSUPPORTED")) {
          err("E_UNSUPPORTED", posOf(t), { kw: `user-defined return types (${t.value})` });
          next();
          retType = "UNSUPPORTED";
        } else err("E_MISSING_RETURNS", posOf(here()), {});
      } else err("E_MISSING_RETURNS", start, {});
      for (const p of params) {
        if (p.byref) err("E_BYREF_FUNCTION", start, {});
      }
    }
    restOfLineIsClean(start);
    advanceLine();
    const body = parseBody([isFunction ? "ENDFUNCTION" : "ENDPROCEDURE"]);
    const closer = isFunction ? "ENDFUNCTION" : "ENDPROCEDURE";
    if (lineStartsWith(closer)) advanceLine();
    else err("E_MISSING_END", start, { open: isFunction ? "FUNCTION" : "PROCEDURE", close: closer, line: start.line });
    return { k: isFunction ? "func" : "proc", name: nameTok && nameTok.value, params, retType, body, pos: start };
  }

  function parseReturn() {
    const start = posOf(next());
    const expr = atEol() ? null : parseExpression();
    finishLine(start);
    return { k: "return", expr, pos: start };
  }

  function parseCall() {
    const start = posOf(next());
    const nameTok = expectIdent("a procedure name");
    const name = nameTok ? nameTok.value : "";
    let args = [];
    if (eatPunct("(")) {
      args = parseArgs();
      if (d.callParens === "optional" && args.length === 0) err("W_IGCSE_CALL_PARENS", start, { name });
    } else if (d.callParens === "required") {
      err("W_CALL_PARENS", start, { name });
    }
    finishLine(start);
    return { k: "call", name, args, pos: start };
  }

  function parseStatement() {
    skipBlank();
    if (li >= lines.length) return null;
    const t = peek();
    if (!t || t.type === "EOL") { advanceLine(); return null; }
    if (deferred(t)) {
      const p = posOf(t);
      const word = t.value.toUpperCase();
      err(deferredCode(word), p, { kw: word });
      skipDeferredBlock(word);
      return { k: "unsupported", name: word, pos: p };
    }
    if (t.type === "KEY") {
      switch (t.value) {
        case "DECLARE": return parseDeclare();
        case "CONSTANT": return parseConstant();
        case "OUTPUT": return parseOutput();
        case "INPUT": return parseInput();
        case "IF": return parseIf();
        case "CASE": return parseCase();
        case "FOR": return parseFor();
        case "WHILE": return parseWhile();
        case "REPEAT": return parseRepeat();
        case "PROCEDURE": return parseRoutine(false);
        case "FUNCTION": return parseRoutine(true);
        case "RETURN": return parseReturn();
        case "CALL": return parseCall();
        case "ELSE": case "ENDIF": case "ENDCASE": case "ENDWHILE":
        case "ENDPROCEDURE": case "ENDFUNCTION": case "NEXT": case "UNTIL": case "OTHERWISE": {
          const p = posOf(t);
          const opener = Object.entries(BLOCK_OPEN).find(([, close]) => close === t.value);
          err("E_STRAY_END", p, { kw: t.value, open: opener ? opener[0] : "a block" });
          advanceLine();
          return null;
        }
        default: break;
      }
      const p = posOf(t);
      err("E_UNEXPECTED", p, { what: `'${t.value}' cannot start a statement` });
      advanceLine();
      return null;
    }
    if (t.type === "IDENT") return parseAssignOrCall();
    const p = posOf(t);
    err("E_UNEXPECTED", p, { what: JSON.stringify(String(t.value)) });
    advanceLine();
    return null;
  }

  function parseBody(stoppers) {
    const body = [];
    let opened = false;
    while (li < lines.length) {
      const t = firstToken(lines[li]);
      if (t && t.type === "KEY" && stoppers.includes(t.value)) { opened = true; break; }
      if (lines[li].blank) { advanceLine(); continue; }
      const before = li;
      const stmt = parseStatement();
      if (stmt) body.push(stmt);
      if (li === before) advanceLine();
    }
    if (!opened && body.length === 0) return body;
    return body;
  }

  const program = [];
  while (li < lines.length) {
    const before = li;
    const stmt = parseStatement();
    if (stmt) program.push(stmt);
    if (li === before) advanceLine();
  }

  const { undeclared } = checkDeclarations(program, diagnostics, posOf);
  return { program, diagnostics, pragmas: tok.pragmas, undeclared };
}

// ------------------------------------------------------------- declarations

function inferType(expr) {
  if (!expr) return "INTEGER";
  if (expr.k === "num") return expr.t;
  if (expr.k === "str") return "STRING";
  if (expr.k === "char") return "CHAR";
  if (expr.k === "bool") return "BOOLEAN";
  if (expr.k === "date") return "DATE";
  if (expr.k === "bin") {
    if (["=", "<>", "<", ">", "<=", ">=", "AND", "OR"].includes(expr.op)) return "BOOLEAN";
    if (expr.op === "&") return "STRING";
    if (expr.op === "/") return "REAL";
    return "INTEGER";
  }
  if (expr.k === "un") return expr.op === "NOT" ? "BOOLEAN" : "INTEGER";
  if (expr.k === "call") return "INTEGER";
  return "INTEGER";
}

function walkExpressions(node, visit) {
  if (!node || typeof node !== "object") return;
  if (node.k === "bin") { walkExpressions(node.l, visit); walkExpressions(node.r, visit); visit(node); return; }
  if (node.k === "un") { walkExpressions(node.e, visit); visit(node); return; }
  if (node.k === "var" || node.k === "index" || node.k === "call") {
    if (node.dims) node.dims.forEach((dim) => walkExpressions(dim, visit));
    if (node.args) node.args.forEach((arg) => walkExpressions(arg, visit));
    visit(node);
    return;
  }
  if (Array.isArray(node)) node.forEach((n) => walkExpressions(n, visit));
}

function flattenScope(body, out) {
  for (const node of body) {
    if (!node) continue;
    out.push(node);
    if (node.k === "if") { flattenScope(node.then || [], out); flattenScope(node.else || [], out); }
    if (node.k === "for" || node.k === "while" || node.k === "repeat") flattenScope(node.body || [], out);
    if (node.k === "case") {
      node.arms.forEach((arm) => flattenScope(arm.body, out));
      flattenScope(node.otherwise || [], out);
    }
  }
}

function ownExpressions(node) {
  const nodes = [];
  switch (node.k) {
    case "assign":
      if (node.target) nodes.push(node.target);
      if (node.expr) nodes.push(node.expr);
      break;
    case "input":
      if (node.target) nodes.push(node.target);
      break;
    case "output":
      nodes.push(...node.exprs);
      break;
    case "if": case "while":
      nodes.push(node.cond);
      break;
    case "repeat":
      nodes.push(node.cond);
      break;
    case "for":
      nodes.push(node.from, node.to);
      if (node.step) nodes.push(node.step);
      break;
    case "case":
      nodes.push(node.subject);
      node.arms.forEach((arm) => arm.values.forEach((v) => { nodes.push(v.lo); if (v.hi) nodes.push(v.hi); }));
      break;
    case "call":
      nodes.push(...node.args);
      break;
    case "return":
      if (node.expr) nodes.push(node.expr);
      break;
    case "declare":
      node.items.forEach((item) => { if (item.bounds) item.bounds.forEach((pair) => nodes.push(...pair)); });
      break;
    default:
      break;
  }
  return nodes.filter(Boolean);
}

function referencedNames(node) {
  const found = [];
  for (const expr of ownExpressions(node)) {
    walkExpressions(expr, (n) => {
      if (n.k === "var" || n.k === "index") found.push({ name: n.name, pos: n.pos });
    });
  }
  return found;
}

function checkScope(body, declaredNames, diagnostics) {
  const flat = [];
  flattenScope(body, flat);
  const seen = new Set(declaredNames.filter(Boolean).map((n) => String(n).toUpperCase()));
  for (const node of flat) {
    if (node.k === "declare") node.items.forEach((item) => item.name && seen.add(item.name.toUpperCase()));
    if (node.k === "constant" && node.name) seen.add(node.name.toUpperCase());
    if (node.k === "for" && node.var) seen.add(node.var.toUpperCase());
  }
  const suggestedFrom = new Map();
  for (const node of flat) {
    if (node.k === "assign" && node.target && node.expr && !suggestedFrom.has(node.target.name.toUpperCase())) {
      suggestedFrom.set(node.target.name.toUpperCase(), inferType(node.expr));
    }
    if (node.k === "input" && node.target && !suggestedFrom.has(node.target.name.toUpperCase())) {
      suggestedFrom.set(node.target.name.toUpperCase(), "INTEGER");
    }
  }
  const reported = new Set();
  for (const node of flat) {
    if (node.k === "proc" || node.k === "func") continue;
    for (const use of referencedNames(node)) {
      const key = use.name.toUpperCase();
      if (seen.has(key) || reported.has(key)) continue;
      reported.add(key);
      diagnostics.push(
        new Diagnostic("E_UNDECLARED", use.pos, { name: use.name, suggested: suggestedFrom.get(key) || "INTEGER" }, {
          type: "insert_declare",
          name: use.name,
          line: use.pos.line,
          suggested: suggestedFrom.get(key) || "INTEGER",
        }),
      );
    }
  }
}

function checkDeclarations(program, diagnostics) {
  const globals = [];
  const routines = new Set();
  for (const node of program) {
    if (node.k === "declare") node.items.forEach((item) => item.name && globals.push(item.name));
    if (node.k === "constant" && node.name) globals.push(node.name);
    if (node.k === "proc" || node.k === "func") routines.add(String(node.name).toUpperCase());
  }
  for (const node of program) {
    if (node.k === "declare") {
      for (const item of node.items) {
        if (item.name && routines.has(item.name.toUpperCase())) {
          diagnostics.push(new Diagnostic("E_RESERVED", item.pos, { name: item.name }));
        }
      }
    }
  }
  const globalBody = program.filter((n) => !["proc", "func"].includes(n.k));
  checkScope(globalBody, globals, diagnostics);
  for (const node of program) {
    if (node.k === "proc" || node.k === "func") {
      checkScope(node.body, [...globals, ...node.params.map((p) => p.name)], diagnostics);
    }
  }
  return {};
}
