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
      { syntax: "+  -  *  /  DIV  MOD", note: "/ always gives a REAL; DIV and MOD need INTEGERs", zh: "算术", skeleton: "OUTPUT 7 / 2\nOUTPUT 7 DIV 2\nOUTPUT 7 MOD 2\n" },
      { syntax: ">  <  >=  <=  =  <>", note: "<> is not equal", zh: "比较", skeleton: "OUTPUT 3 <> 4\n" },
      { syntax: "AND  OR  NOT", note: "both sides must be BOOLEAN", zh: "逻辑", skeleton: "DECLARE ok : BOOLEAN\nok <- TRUE\nOUTPUT ok AND NOT ok\n" },
      { syntax: "\"Summer\" & \" Pudding\"", note: "& joins strings, not +", zh: "字符串拼接", skeleton: "OUTPUT \"Summer\" & \" Pudding\"\n" },
    ],
  },
  {
    group: "Built-in functions",
    items: [
      { syntax: "LENGTH(s)", note: "number of characters", zh: "长度", skeleton: "OUTPUT LENGTH(\"Happy Days\")\n" },
      { syntax: "MID(s, start, count)", note: "count characters from position start, 1-based", zh: "截取", skeleton: "OUTPUT MID(\"ABCDEFGH\", 2, 3)\n" },
      { syntax: "RIGHT(s, n)", note: "rightmost n characters", zh: "右侧", skeleton: "OUTPUT RIGHT(\"ABCDEFGH\", 3)\n" },
      { syntax: "LCASE(c)  UCASE(c)", note: "change the case of one CHAR", zh: "大小写", skeleton: "OUTPUT UCASE('h')\n" },
      { syntax: "INT(x)", note: "integer part of a REAL", zh: "取整", skeleton: "OUTPUT INT(27.5415)\n" },
      { syntax: "RAND(x)", note: "a REAL from 0 up to but not including x", zh: "随机数", skeleton: "OUTPUT INT(RAND(6) + 1)\n" },
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
];

export const KEYWORD_LIST = [
  "AND", "ARRAY", "BYREF", "BYVAL", "CALL", "CASE", "CHAR", "CONSTANT", "DATE", "DECLARE", "DIV",
  "ELSE", "ENDCASE", "ENDFUNCTION", "ENDIF", "ENDPROCEDURE", "ENDWHILE", "FALSE", "FOR", "FUNCTION",
  "IF", "INPUT", "INTEGER", "MOD", "NEXT", "NOT", "OF", "OTHERWISE", "OUTPUT", "PROCEDURE", "REAL",
  "REPEAT", "RETURN", "RETURNS", "STEP", "STRING", "THEN", "TO", "TRUE", "UNTIL", "WHILE",
];

export const BUILTIN_LIST = ["LENGTH", "MID", "RIGHT", "LCASE", "UCASE", "INT", "RAND"];
