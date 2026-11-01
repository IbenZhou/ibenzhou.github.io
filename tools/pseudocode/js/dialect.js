export const SYLLABUSES = ["9618", "0478"];

const base = {
  indent: 3,
  hasDate: true,
  hasByRef: true,
  caretIsPointer: true,
  caseRanges: true,
  whileDo: "note",
  thenOwnLine: "note",
  callParens: "required",
  constantForm: "equals",
  underscoreInNames: true,
  pascalStartNames: "silent",
};

export const DIALECTS = {
  "9618": {
    ...base,
    id: "9618",
    label: "A Level 9618",
    short: "A Level",
    blurb: "Cambridge International AS & A Level Computer Science",
  },
  "0478": {
    ...base,
    id: "0478",
    label: "IGCSE 0478",
    short: "IGCSE",
    blurb: "Cambridge IGCSE Computer Science",
    indent: 4,
    hasDate: false,
    hasByRef: false,
    caretIsPointer: false,
    caseRanges: false,
    whileDo: "required",
    thenOwnLine: "allowed",
    callParens: "optional",
    constantForm: "arrow",
    underscoreInNames: false,
    pascalStartNames: "note",
  },
};

export function dialectOf(id) {
  return DIALECTS[id] || DIALECTS["9618"];
}

const SHARED_KEYWORDS = [
  "DECLARE", "CONSTANT", "ARRAY", "OF", "INTEGER", "REAL", "CHAR", "STRING", "BOOLEAN",
  "IF", "THEN", "ELSE", "ENDIF", "CASE", "OTHERWISE", "ENDCASE",
  "FOR", "TO", "STEP", "NEXT", "WHILE", "ENDWHILE", "REPEAT", "UNTIL",
  "PROCEDURE", "ENDPROCEDURE", "FUNCTION", "ENDFUNCTION", "RETURNS", "RETURN", "CALL",
  "OUTPUT", "INPUT", "AND", "OR", "NOT", "TRUE", "FALSE",
];

const ONLY_9618 = ["DATE", "BYREF", "BYVAL"];

export function keywordsFor(d) {
  const words = d.id === "0478" ? SHARED_KEYWORDS.slice() : SHARED_KEYWORDS.concat(ONLY_9618);
  return new Set(words);
}

export const MOD_KEYWORDS = new Set(["MOD", "DIV"]);

// Which spellings each syllabus expects. `home` runs silently; `away` runs with a note.
export const BUILTIN_HOME = {
  "9618": ["LENGTH", "MID", "RIGHT", "LCASE", "UCASE", "INT", "RAND"],
  "0478": ["LENGTH", "SUBSTRING", "LCASE", "UCASE", "ROUND", "RANDOM"],
};

const AWAY_MESSAGE = {
  MID: (d) => (d.id === "0478" ? { code: "W_IGCSE_SUBSTRING", ctx: { alt: "SUBSTRING" } } : null),
  RIGHT: (d) => (d.id === "0478" ? { code: "W_IGCSE_NO_RIGHT", ctx: {} } : null),
  INT: (d) => (d.id === "0478" ? { code: "W_IGCSE_ROUND", ctx: { alt: "ROUND(x, 0)" } } : null),
  RAND: (d) => (d.id === "0478" ? { code: "W_IGCSE_RANDOM", ctx: {} } : null),
  SUBSTRING: (d) => (d.id === "9618" ? { code: "W_ALEVEL_MID", ctx: { alt: "MID" } } : null),
  ROUND: (d) => (d.id === "9618" ? { code: "W_ALEVEL_INT", ctx: { alt: "INT" } } : null),
  RANDOM: (d) => (d.id === "9618" ? { code: "W_ALEVEL_RAND", ctx: {} } : null),
  MOD: (d) => (d.id === "9618" ? { code: "W_ALEVEL_FUNCTION_MOD", ctx: { alt: "a MOD b" } } : null),
  DIV: (d) => (d.id === "9618" ? { code: "W_ALEVEL_FUNCTION_MOD", ctx: { alt: "a DIV b" } } : null),
};

export function builtinNote(name, d) {
  const maker = AWAY_MESSAGE[name];
  if (!maker) return null;
  if (BUILTIN_HOME[d.id].includes(name)) return null;
  return maker(d);
}

export function isBuiltinKnown(name, d) {
  return BUILTIN_HOME[d.id].includes(name) || Boolean(AWAY_MESSAGE[name]);
}
