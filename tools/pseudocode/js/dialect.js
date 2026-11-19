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
  "9618": ["LENGTH", "LEFT", "MID", "RIGHT", "TO_UPPER", "TO_LOWER",
    "NUM_TO_STR", "STR_TO_NUM", "IS_NUM", "ASC", "CHR", "INT", "RAND",
    "DAY", "MONTH", "YEAR", "DAYINDEX", "SETDATE", "TODAY"],
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
  LEFT: (d) => (d.id === "0478" ? { code: "W_IGCSE_NO_LEFT", ctx: {} } : null),
  TO_UPPER: (d) => (d.id === "0478" ? { code: "W_IGCSE_UCASE", ctx: {} } : null),
  TO_LOWER: (d) => (d.id === "0478" ? { code: "W_IGCSE_LCASE", ctx: {} } : null),
  NUM_TO_STR: (d) => (d.id === "0478" ? { code: "W_ALEVEL_ONLY_FUNCTION", ctx: { name: "NUM_TO_STR" } } : null),
  STR_TO_NUM: (d) => (d.id === "0478" ? { code: "W_ALEVEL_ONLY_FUNCTION", ctx: { name: "STR_TO_NUM" } } : null),
  IS_NUM: (d) => (d.id === "0478" ? { code: "W_ALEVEL_ONLY_FUNCTION", ctx: { name: "IS_NUM" } } : null),
  ASC: (d) => (d.id === "0478" ? { code: "W_ALEVEL_ONLY_FUNCTION", ctx: { name: "ASC" } } : null),
  CHR: (d) => (d.id === "0478" ? { code: "W_ALEVEL_ONLY_FUNCTION", ctx: { name: "CHR" } } : null),
  DAY: (d) => (d.id === "0478" ? { code: "W_ALEVEL_ONLY_FUNCTION", ctx: { name: "DAY" } } : null),
  MONTH: (d) => (d.id === "0478" ? { code: "W_ALEVEL_ONLY_FUNCTION", ctx: { name: "MONTH" } } : null),
  YEAR: (d) => (d.id === "0478" ? { code: "W_ALEVEL_ONLY_FUNCTION", ctx: { name: "YEAR" } } : null),
  DAYINDEX: (d) => (d.id === "0478" ? { code: "W_ALEVEL_ONLY_FUNCTION", ctx: { name: "DAYINDEX" } } : null),
  SETDATE: (d) => (d.id === "0478" ? { code: "W_ALEVEL_ONLY_FUNCTION", ctx: { name: "SETDATE" } } : null),
  TODAY: (d) => (d.id === "0478" ? { code: "W_ALEVEL_ONLY_FUNCTION", ctx: { name: "TODAY" } } : null),
  UCASE: (d) => (d.id === "9618" ? { code: "W_ALEVEL_INSERT_NAME", ctx: { name: "UCASE", alt: "TO_UPPER" } } : null),
  LCASE: (d) => (d.id === "9618" ? { code: "W_ALEVEL_INSERT_NAME", ctx: { name: "LCASE", alt: "TO_LOWER" } } : null),
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

// Built-in routine names are never subject to identifier style rules.
export const BUILTIN_WORDS = new Set([
  ...BUILTIN_HOME["9618"],
  ...BUILTIN_HOME["0478"],
  ...Object.keys(AWAY_MESSAGE),
  "MOD", "DIV",
]);
