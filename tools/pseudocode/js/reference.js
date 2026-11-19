import { KEYWORDS } from "./tokeniser.js";

export const REFERENCE = [
  {
    group: "Variables",
    items: [
      { syntax: "DECLARE name : INTEGER", note: "one variable per line is the exam form", zh: "声明变量", skeleton: "DECLARE name : INTEGER\n" },
      { syntax: "DECLARE name : ARRAY[1:10] OF INTEGER", note: "always write both bounds", zh: "一维数组", skeleton: "DECLARE data : ARRAY[1:10] OF INTEGER\n" },
      { syntax: "DECLARE grid : ARRAY[1:3,1:3] OF CHAR", note: "two dimensions", zh: "二维数组", skeleton: "DECLARE grid : ARRAY[1:3,1:3] OF CHAR\n" },
      { syntax: "CONSTANT HourlyRate = 6.50", note: "a literal only, never an expression", zh: "常量", skeleton: "CONSTANT limit = 100\n" },
      { syntax: "total <- total + 1", note: "<- assigns, = compares", zh: "赋值", skeleton: "total <- 0\n" },
      { syntax: "Types: INTEGER REAL CHAR STRING BOOLEAN DATE", note: "CHAR uses 'single', STRING uses \"double\"", zh: "数据类型", skeleton: "DECLARE letter : CHAR\nletter <- 'a'\n" },
    ],
  },
  {
    group: "Input and output",
    items: [
      { syntax: "OUTPUT \"Score: \", Score", note: "values run together; put your own spaces inside the strings", zh: "输出", skeleton: "OUTPUT \"Score: \", 10\n" },
      { syntax: "INPUT answer", note: "read the input box, one value per line", zh: "输入", skeleton: "DECLARE answer : INTEGER\nINPUT answer\nOUTPUT answer\n" },
    ],
  },
  {
    group: "Operators",
    items: [
      { syntax: "+  -  *  /", note: "/ always gives a REAL; MOD, DIV, AND, OR, NOT and the comparisons are listed with the insert below", zh: "四则运算", skeleton: "OUTPUT 7 / 2\n" },
    ],
  },
  {
    group: "Selection",
    items: [
      { syntax: "IF condition THEN ... ELSE ... ENDIF", note: "every IF needs its own ENDIF; there is no ELSE IF", zh: "选择", skeleton: "DECLARE mark : INTEGER\nmark <- 60\nIF mark >= 50 THEN\n    OUTPUT \"pass\"\nELSE\n    OUTPUT \"fail\"\nENDIF\n" },
      { syntax: "CASE OF var / value : stmt / OTHERWISE : stmt / ENDCASE", note: "a label may be a range with TO; OTHERWISE goes last", zh: "多路选择", skeleton: "DECLARE key : CHAR\nkey <- 'q'\nCASE OF key\n    'q' : OUTPUT \"quit\"\n    'r' : OUTPUT \"run\"\n    OTHERWISE : OUTPUT \"other\"\nENDCASE\n" },
    ],
  },
  {
    group: "Iteration",
    items: [
      { syntax: "FOR count <- 1 TO 10 ... NEXT count", note: "repeat the variable after NEXT", zh: "计数循环", skeleton: "FOR i <- 1 TO 5\n    OUTPUT i\nNEXT i\n" },
      { syntax: "FOR count <- 10 TO 1 STEP -1", note: "STEP may be negative", zh: "步长", skeleton: "FOR i <- 10 TO 1 STEP -2\n    OUTPUT i\nNEXT i\n" },
      { syntax: "WHILE condition ... ENDWHILE", note: "tested before each pass, so it may run zero times", zh: "当型循环", skeleton: "DECLARE n : INTEGER\nn <- 10\nWHILE n > 3\n    n <- n - 2\nENDWHILE\nOUTPUT n\n" },
      { syntax: "REPEAT ... UNTIL condition", note: "tested after each pass, so it always runs once", zh: "直到型循环", skeleton: "DECLARE answer : STRING\nREPEAT\n    INPUT answer\nUNTIL answer = \"stop\"\n" },
    ],
  },
  {
    group: "Routines",
    items: [
      { syntax: "PROCEDURE name(p : INTEGER) ... ENDPROCEDURE", note: "called with CALL name(value)", zh: "过程", skeleton: "PROCEDURE greet(name : STRING)\n    OUTPUT \"Hello \", name\nENDPROCEDURE\n\nCALL greet(\"Amara\")\n" },
      { syntax: "FUNCTION name(p : INTEGER) RETURNS INTEGER ... ENDFUNCTION", note: "used inside an expression, must RETURN", zh: "函数", skeleton: "FUNCTION double(n : INTEGER) RETURNS INTEGER\n    RETURN n * 2\nENDFUNCTION\n\nOUTPUT double(4)\n" },
      { syntax: "PROCEDURE swap(BYREF a : INTEGER, b : INTEGER)", note: "BYREF lets the caller's variable change; BYVAL is the default", zh: "传引用", skeleton: "PROCEDURE swap(BYREF x : INTEGER, y : INTEGER)\n    DECLARE temp : INTEGER\n    temp <- x\n    x <- y\n    y <- temp\nENDPROCEDURE\n\nDECLARE a : INTEGER\nDECLARE b : INTEGER\na <- 1\nb <- 2\nCALL swap(a, b)\nOUTPUT a\nOUTPUT b\n" },
    ],
  },
  {
    group: "Not in this editor yet",
    items: [
      { syntax: "TYPE ... ENDTYPE (records, enums)", note: "guide section 4 — recognised, but v1 cannot run it", zh: "自定义数据类型", skeleton: "" },
      { syntax: "OPENFILE / READFILE / WRITEFILE / SEEK", note: "guide section 9 — file handling", zh: "文件处理", skeleton: "" },
      { syntax: "CLASS / INHERITS / PUBLIC / PRIVATE / NEW / SUPER", note: "guide section 10 — object-oriented programming", zh: "面向对象", skeleton: "" },
    ],
  },

  // ---- Exactly what the exam paper hands to candidates, in the insert's own order ----
  {
    group: "Insert · 字符串与字符函数",
    items: [
      { syntax: "LEFT(ThisString, x)", note: "leftmost x characters — LEFT(\"ABCDEFGH\", 3) is \"ABC\"", zh: "左侧截取", skeleton: 'OUTPUT LEFT("ABCDEFGH", 3)\n' },
      { syntax: "RIGHT(ThisString, x)", note: "rightmost x characters — RIGHT(\"ABCDEFGH\", 3) is \"FGH\"", zh: "右侧截取", skeleton: 'OUTPUT RIGHT("ABCDEFGH", 3)\n' },
      { syntax: "MID(ThisString, x, y)", note: "y characters starting at position x — MID(\"ABCDEFGH\", 2, 3) is \"BCD\"", zh: "截取", skeleton: 'OUTPUT MID("ABCDEFGH", 2, 3)\n' },
      { syntax: "LENGTH(ThisString)", note: "number of characters — LENGTH(\"Happy Days\") is 10", zh: "长度", skeleton: 'OUTPUT LENGTH("Happy Days")\n' },
      { syntax: "TO_UPPER(x)  TO_LOWER(x)", note: "CHAR or STRING in, the same type out; IGCSE calls these UCASE/LCASE", zh: "大小写", skeleton: 'OUTPUT TO_UPPER("Error 803")\n' },
      { syntax: "NUM_TO_STR(x)", note: "a number as a string; negatives start with -", zh: "数字转字符串", skeleton: "OUTPUT NUM_TO_STR(87.5)\n" },
      { syntax: "STR_TO_NUM(x)", note: "a string as a number; whole if there is no decimal point", zh: "字符串转数字", skeleton: 'OUTPUT STR_TO_NUM("23.45") + 1\n' },
      { syntax: "IS_NUM(ThisString)", note: "TRUE if the value is a valid number", zh: "判断是否为数字", skeleton: 'OUTPUT IS_NUM("-12.36")\n' },
      { syntax: "ASC(ThisChar)", note: "the ASCII value — ASC('A') is 65", zh: "取 ASCII", skeleton: "OUTPUT ASC('A')\n" },
      { syntax: "CHR(x)", note: "the character with that ASCII value — CHR(65) is 'A'", zh: "ASCII 转字符", skeleton: "OUTPUT CHR(66)\n" },
    ],
  },
  {
    group: "Insert · 数值函数",
    items: [
      { syntax: "INT(x)", note: "the integer part of a REAL — INT(27.5415) is 27", zh: "取整", skeleton: "OUTPUT INT(27.5415)\n" },
      { syntax: "RAND(x)", note: "a REAL from 0 up to but not including x", zh: "随机数", skeleton: "OUTPUT INT(RAND(6) + 1)\n" },
    ],
  },
  {
    group: "Insert · 日期函数",
    items: [
      { syntax: "DAY(ThisDate)  MONTH(ThisDate)  YEAR(ThisDate)", note: "the three parts of a DATE — DAY(04/10/2003) is 4", zh: "年月日", skeleton: "OUTPUT DAY(04/10/2003)\nOUTPUT MONTH(04/10/2003)\nOUTPUT YEAR(04/10/2003)\n" },
      { syntax: "DAYINDEX(ThisDate)", note: "day of the week, Sunday = 1", zh: "星期几", skeleton: "OUTPUT DAYINDEX(09/05/2023)\n" },
      { syntax: "SETDATE(Day, Month, Year)", note: "build a DATE from three integers", zh: "构造日期", skeleton: "DECLARE D : DATE\nD <- SETDATE(26, 10, 2003)\nOUTPUT D\n" },
      { syntax: "TODAY()", note: "today's date", zh: "今天", skeleton: "OUTPUT TODAY()\n" },
    ],
  },
  {
    group: "Insert · 文本文件函数",
    items: [
      { syntax: "EOF(FileName)", note: "TRUE when the file has no more lines; needs the file open in READ mode, which this editor cannot do yet", zh: "文件结束", skeleton: "" },
    ],
  },
  {
    group: "Insert · 运算符",
    items: [
      { syntax: "&", note: "joins two strings; a CHAR may also be joined to a STRING", zh: "字符串拼接", skeleton: 'OUTPUT "Summer" & " " & "Pudding"\n' },
      { syntax: "AND  OR  NOT", note: "operate on BOOLEAN values", zh: "逻辑", skeleton: "OUTPUT TRUE AND NOT FALSE\n" },
      { syntax: "MOD", note: "remainder — 10 MOD 3 is 1", zh: "取余", skeleton: "OUTPUT 10 MOD 3\n" },
      { syntax: "DIV", note: "quotient — 10 DIV 3 is 3", zh: "整除", skeleton: "OUTPUT 10 DIV 3\n" },
    ],
  },
  {
    group: "Insert · 比较运算符",
    items: [
      { syntax: "=   <   >   <=   >=   <>", note: "same type on both sides; case sensitive for CHAR and STRING", zh: "比较", skeleton: 'OUTPUT "Program" = "program"\n' },
    ],
  },
];

export const IGCSE_REFERENCE = [
  {
    group: "Variables",
    items: [
      { syntax: "DECLARE name : INTEGER", note: "one variable per line; names start with a capital and use no underscore", zh: "声明变量", skeleton: "DECLARE Name : INTEGER\n" },
      { syntax: "DECLARE data : ARRAY[1:10] OF INTEGER", note: "always write both bounds", zh: "一维数组", skeleton: "DECLARE Data : ARRAY[1:10] OF INTEGER\n" },
      { syntax: "DECLARE grid : ARRAY[1:3, 1:3] OF CHAR", note: "two dimensions", zh: "二维数组", skeleton: "DECLARE Grid : ARRAY[1:3, 1:3] OF CHAR\n" },
      { syntax: "CONSTANT HourlyRate ← 6.50", note: "IGCSE uses the arrow, not equals", zh: "常量", skeleton: "CONSTANT Limit ← 100\n" },
      { syntax: "Total ← Total + 1", note: "<- assigns, = compares", zh: "赋值", skeleton: "Total ← 0\n" },
      { syntax: "Types: INTEGER REAL CHAR STRING BOOLEAN", note: "IGCSE has no DATE type", zh: "数据类型", skeleton: "DECLARE Letter : CHAR\nLetter ← 'a'\n" },
    ],
  },
  {
    group: "Input and output",
    items: [
      { syntax: "OUTPUT \"Score: \", Score", note: "values run together; put your own spaces inside the strings", zh: "输出", skeleton: "OUTPUT \"Score: \", 10\n" },
      { syntax: "INPUT answer", note: "read the input box, one value per line", zh: "输入", skeleton: "DECLARE Answer : INTEGER\nINPUT Answer\nOUTPUT Answer\n" },
    ],
  },
  {
    group: "Operators",
    items: [
      { syntax: "+  -  *  /  ^", note: "^ raises to a power; / gives a real quotient", zh: "算术", skeleton: "OUTPUT 2 ^ 3\nOUTPUT 7 / 2\n" },
      { syntax: "DIV(a, b)   MOD(a, b)", note: "IGCSE writes these as functions, not operators", zh: "整除与取余", skeleton: "OUTPUT DIV(7, 2)\nOUTPUT MOD(7, 2)\n" },
      { syntax: ">  <  >=  <=  =  <>", note: "<> is not equal", zh: "比较", skeleton: "OUTPUT 3 <> 4\n" },
      { syntax: "AND  OR  NOT", note: "both sides must be BOOLEAN", zh: "逻辑", skeleton: "DECLARE Ok : BOOLEAN\nOk ← TRUE\nOUTPUT Ok AND NOT Ok\n" },
      { syntax: "\"Summer\" & \" Pudding\"", note: "& joins strings, not +", zh: "字符串拼接", skeleton: "OUTPUT \"Summer\" & \" Pudding\"\n" },
    ],
  },
  {
    group: "Built-in functions",
    items: [
      { syntax: "LENGTH(s)", note: "number of characters", zh: "长度", skeleton: "OUTPUT LENGTH(\"Happy Days\")\n" },
      { syntax: "SUBSTRING(s, start, length)", note: "IGCSE's name for taking part of a string", zh: "截取", skeleton: "OUTPUT SUBSTRING(\"Happy Days\", 1, 5)\n" },
      { syntax: "LCASE(s)  UCASE(s)", note: "accept a string or a single character", zh: "大小写", skeleton: "OUTPUT UCASE(\"Happy\")\n" },
      { syntax: "ROUND(x, places)", note: "x rounded to places decimal places", zh: "四舍五入", skeleton: "OUTPUT ROUND(2.756, 2)\n" },
      { syntax: "RANDOM()", note: "a number from 0 to 1 inclusive", zh: "随机数", skeleton: "OUTPUT RANDOM()\n" },
    ],
  },
  {
    group: "Selection",
    items: [
      { syntax: "IF condition / THEN on its own line / ENDIF", note: "IGCSE prints THEN below the condition, indented two spaces", zh: "选择", skeleton: "DECLARE Mark : INTEGER\nMark ← 60\nIF Mark >= 50\n    THEN\n        OUTPUT \"pass\"\n    ELSE\n        OUTPUT \"fail\"\nENDIF\n" },
      { syntax: "CASE OF var / value : stmt / OTHERWISE stmt / ENDCASE", note: "single values only, and OTHERWISE takes no colon", zh: "多路选择", skeleton: "DECLARE Key : CHAR\nKey ← 'q'\nCASE OF Key\n    'q' : OUTPUT \"quit\"\n    OTHERWISE OUTPUT \"other\"\nENDCASE\n" },
    ],
  },
  {
    group: "Iteration",
    items: [
      { syntax: "FOR count ← 1 TO 10 / NEXT count", note: "repeat the variable after NEXT", zh: "计数循环", skeleton: "FOR I ← 1 TO 5\n    OUTPUT I\nNEXT I\n" },
      { syntax: "FOR count ← 10 TO 1 STEP -1", note: "STEP may be negative", zh: "步长", skeleton: "FOR I ← 10 TO 1 STEP -2\n    OUTPUT I\nNEXT I\n" },
      { syntax: "WHILE condition DO / ENDWHILE", note: "IGCSE needs the DO", zh: "当型循环", skeleton: "DECLARE N : INTEGER\nN ← 10\nWHILE N > 3 DO\n    N ← N - 2\nENDWHILE\nOUTPUT N\n" },
      { syntax: "REPEAT / UNTIL condition", note: "tested after each pass, so it always runs once", zh: "直到型循环", skeleton: "DECLARE Answer : STRING\nREPEAT\n    INPUT Answer\nUNTIL Answer = \"stop\"\n" },
    ],
  },
  {
    group: "Routines",
    items: [
      { syntax: "PROCEDURE name(p : INTEGER) / ENDPROCEDURE", note: "no parameters means no brackets: PROCEDURE Name", zh: "过程", skeleton: "PROCEDURE Greet(Name : STRING)\n    OUTPUT \"Hello \", Name\nENDPROCEDURE\n\nCALL Greet(\"Amara\")\n" },
      { syntax: "CALL name / CALL name(value)", note: "IGCSE calls a procedure without brackets when it takes no parameters", zh: "调用过程", skeleton: "PROCEDURE Beep\n    OUTPUT \"beep\"\nENDPROCEDURE\n\nCALL Beep\n" },
      { syntax: "FUNCTION name(p : INTEGER) RETURNS INTEGER", note: "used inside an expression, must RETURN", zh: "函数", skeleton: "FUNCTION Double(N : INTEGER) RETURNS INTEGER\n    RETURN N * 2\nENDFUNCTION\n\nOUTPUT Double(4)\n" },
    ],
  },
  {
    group: "Not in this editor yet",
    items: [
      { syntax: "OPENFILE / READFILE / WRITEFILE / CLOSEFILE", note: "IGCSE file handling is recognised but cannot run here yet", zh: "文件处理", skeleton: "" },
      { syntax: "BYREF / TYPE / CLASS", note: "not part of IGCSE 0478 at all", zh: "只在 A Level 出现", skeleton: "" },
    ],
  },
];

export function referenceFor(id) {
  return id === "0478" ? IGCSE_REFERENCE : REFERENCE;
}

export const KEYWORDS_9618 = [...KEYWORDS];
export const KEYWORDS_0478 = [...KEYWORDS].filter((w) => !["DATE", "BYREF", "BYVAL"].includes(w));

export function keywordsFor(id) {
  return id === "0478" ? KEYWORDS_0478 : KEYWORDS_9618;
}

export const BUILTINS_9618 = [
  "LEFT", "RIGHT", "MID", "LENGTH", "TO_UPPER", "TO_LOWER",
  "NUM_TO_STR", "STR_TO_NUM", "IS_NUM", "ASC", "CHR", "INT", "RAND",
  "DAY", "MONTH", "YEAR", "DAYINDEX", "SETDATE", "TODAY",
];
export const BUILTINS_0478 = ["LENGTH", "SUBSTRING", "LCASE", "UCASE", "ROUND", "RANDOM"];

export function builtinListFor(id) {
  return id === "0478" ? BUILTINS_0478 : BUILTINS_9618;
}
