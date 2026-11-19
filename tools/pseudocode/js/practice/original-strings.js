// Original questions written for this bank, grouped by topic.
export const STRINGS = [
  // ---------------------------------------------------------------------------
  // String handling (difficulty 1-2)
  // ---------------------------------------------------------------------------
  {
    id: "orig-str-01",
    title: "LenAndLast() — length and last character",
    source: "原创 · §11.3 字符串处理",
    marks: 4,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION LenAndLast(InString : STRING) RETURNS STRING",
    prompt: [
      "A function `LenAndLast()` is called with a string and returns a new string made up of:",
      "- the length of the string",
      "- a hyphen character `'-'`",
      "- the last character of the string",
      "",
      "For example, `LenAndLast(\"Banana\")` returns `\"6-a\"`.",
      "",
      "The string passed in always contains at least one character.",
      "",
      "Write pseudocode for the function `LenAndLast()`."
    ].join("\n"),
    model: `FUNCTION LenAndLast(InString : STRING) RETURNS STRING
    DECLARE Result : STRING
    Result <- NUM_TO_STR(LENGTH(InString)) & "-" & RIGHT(InString, 1)
    RETURN Result
ENDFUNCTION`,
    after: `OUTPUT LenAndLast("Banana")`,
    cases: [
      { label: 'LenAndLast("Banana")', after: 'OUTPUT LenAndLast("Banana")' },
      { label: 'LenAndLast("A")', after: 'OUTPUT LenAndLast("A")' },
      { label: 'LenAndLast("Computer Science")', after: 'OUTPUT LenAndLast("Computer Science")' },
      { label: 'LenAndLast("2026")', after: 'OUTPUT LenAndLast("2026")' },
    ],
  },

  {
    id: "orig-str-02",
    title: "FirstChars() — the first n characters",
    source: "原创 · §11.3 字符串处理",
    marks: 5,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION FirstChars(InString : STRING, Num : INTEGER) RETURNS STRING",
    prompt: [
      "A function `FirstChars()` takes a string and an integer. It returns the first `Num`",
      "characters of the string:",
      "- if `Num` is greater than the length of the string, the whole string is returned",
      "- if `Num` is less than 1, the empty string is returned",
      "",
      "For example, `FirstChars(\"Programming\", 4)` returns `\"Prog\"`.",
      "",
      "Write pseudocode for the function `FirstChars()`."
    ].join("\n"),
    model: `FUNCTION FirstChars(InString : STRING, Num : INTEGER) RETURNS STRING
    DECLARE Result : STRING
    IF Num < 1 THEN
        Result <- ""
    ELSE
        IF Num > LENGTH(InString) THEN
            Result <- InString
        ELSE
            Result <- LEFT(InString, Num)
        ENDIF
    ENDIF
    RETURN Result
ENDFUNCTION`,
    after: `OUTPUT "[", FirstChars("Programming", 4), "]"`,
    cases: [
      { label: 'FirstChars("Programming", 4)', after: 'OUTPUT "[", FirstChars("Programming", 4), "]"' },
      { label: 'FirstChars("Hi", 10)', after: 'OUTPUT "[", FirstChars("Hi", 10), "]"' },
      { label: 'FirstChars("Data", 0)', after: 'OUTPUT "[", FirstChars("Data", 0), "]"' },
      { label: 'FirstChars("Algorithm", 9)', after: 'OUTPUT "[", FirstChars("Algorithm", 9), "]"' },
    ],
  },

  {
    id: "orig-str-03",
    title: "SubText() — characters from the middle",
    source: "原创 · §11.3 字符串处理",
    marks: 6,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION SubText(InString : STRING, Start : INTEGER, Num : INTEGER) RETURNS STRING",
    prompt: [
      "A function `SubText()` takes a string, a start position and a number of characters.",
      "It returns the `Num` characters that start at position `Start`.",
      "",
      "It returns the empty string `\"\"` if `Start` is less than 1, if `Num` is less than 1,",
      "or if the substring would go beyond the end of the string.",
      "",
      "For example, `SubText(\"Examination\", 5, 4)` returns `\"inat\"`.",
      "",
      "Write pseudocode for the function `SubText()` using `MID()`."
    ].join("\n"),
    model: `FUNCTION SubText(InString : STRING, Start : INTEGER, Num : INTEGER) RETURNS STRING
    IF Start < 1 OR Num < 1 THEN
        RETURN ""
    ENDIF
    IF Start + Num - 1 > LENGTH(InString) THEN
        RETURN ""
    ENDIF
    RETURN MID(InString, Start, Num)
ENDFUNCTION`,
    after: `OUTPUT "[", SubText("Examination", 5, 4), "]"`,
    cases: [
      { label: 'SubText("Examination", 5, 4)', after: 'OUTPUT "[", SubText("Examination", 5, 4), "]"' },
      { label: 'SubText("Examination", 1, 11)', after: 'OUTPUT "[", SubText("Examination", 1, 11), "]"' },
      { label: 'SubText("Examination", 9, 5)', after: 'OUTPUT "[", SubText("Examination", 9, 5), "]"' },
      { label: 'SubText("Examination", 4, 0)', after: 'OUTPUT "[", SubText("Examination", 4, 0), "]"' },
    ],
  },

  {
    id: "orig-str-04",
    title: "Shout() — lower first letter, upper the rest",
    source: "原创 · §11.3 字符串处理",
    marks: 6,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION Shout(InString : STRING) RETURNS STRING",
    prompt: [
      "An online forum displays a member's user name with the first character in lower case",
      "and every other character in upper case.",
      "",
      "For example, the user name `\"Computer\"` is displayed as `\"cOMPUTER\"`.",
      "",
      "A function `Shout()` takes the user name as a string and returns the displayed",
      "version. The string always contains at least one character.",
      "",
      "Write pseudocode for the function `Shout()`."
    ].join("\n"),
    model: `FUNCTION Shout(InString : STRING) RETURNS STRING
    DECLARE First : STRING
    DECLARE Rest : STRING
    First <- TO_LOWER(MID(InString, 1, 1))
    Rest <- TO_UPPER(MID(InString, 2, LENGTH(InString) - 1))
    RETURN First & Rest
ENDFUNCTION`,
    after: `OUTPUT Shout("Computer")`,
    cases: [
      { label: 'Shout("Computer")', after: 'OUTPUT Shout("Computer")' },
      { label: 'Shout("forumName")', after: 'OUTPUT Shout("forumName")' },
      { label: 'Shout("A")', after: 'OUTPUT Shout("A")' },
      { label: 'Shout("Banana")', after: 'OUTPUT Shout("Banana")' },
    ],
  },

  {
    id: "orig-str-05",
    title: "CountChar() — occurrences of a character",
    source: "原创 · §11.3 字符串处理",
    marks: 6,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION CountChar(InString : STRING, Search : CHAR) RETURNS INTEGER",
    prompt: [
      "A function `CountChar()` takes a string and a single character. It returns the",
      "number of times that character occurs in the string.",
      "",
      "Upper-case and lower-case characters are different, so `'s'` does not match `'S'`.",
      "",
      "For example, `CountChar(\"Mississippi\", 's')` returns 4.",
      "",
      "Write pseudocode for the function `CountChar()`."
    ].join("\n"),
    model: `FUNCTION CountChar(InString : STRING, Search : CHAR) RETURNS INTEGER
    DECLARE Count : INTEGER
    DECLARE Index : INTEGER
    Count <- 0
    FOR Index <- 1 TO LENGTH(InString)
        IF MID(InString, Index, 1) = Search THEN
            Count <- Count + 1
        ENDIF
    NEXT Index
    RETURN Count
ENDFUNCTION`,
    after: `OUTPUT CountChar("Mississippi", 's')`,
    cases: [
      { label: "CountChar(\"Mississippi\", 's')", after: `OUTPUT CountChar("Mississippi", 's')` },
      { label: "CountChar(\"Mississippi\", 'S')", after: `OUTPUT CountChar("Mississippi", 'S')` },
      { label: "CountChar(\"Banana\", 'a')", after: `OUTPUT CountChar("Banana", 'a')` },
      { label: "CountChar(\"Banana\", 'n')", after: `OUTPUT CountChar("Banana", 'n')` },
    ],
  },

  {
    id: "orig-str-06",
    title: "CountSub() — occurrences of a substring",
    source: "原创 · §11.3 字符串处理",
    marks: 7,
    difficulty: 2,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION CountSub(InString : STRING, Search : STRING) RETURNS INTEGER",
    prompt: [
      "A function `CountSub()` takes a string and a search string. It returns the number of",
      "times the search string occurs in the string.",
      "",
      "Occurrences never overlap, so `\"aaa\"` contains `\"aa\"` only once.",
      "",
      "For example, `CountSub(\"banana\", \"an\")` returns 2.",
      "",
      "Assume that both strings contain at least one character.",
      "",
      "Write pseudocode for the function `CountSub()`."
    ].join("\n"),
    model: `FUNCTION CountSub(InString : STRING, Search : STRING) RETURNS INTEGER
    DECLARE Count : INTEGER
    DECLARE Index : INTEGER
    DECLARE Size : INTEGER
    Count <- 0
    Size <- LENGTH(Search)
    Index <- 1
    WHILE Index <= LENGTH(InString) - Size + 1
        IF MID(InString, Index, Size) = Search THEN
            Count <- Count + 1
            Index <- Index + Size
        ELSE
            Index <- Index + 1
        ENDIF
    ENDWHILE
    RETURN Count
ENDFUNCTION`,
    after: `OUTPUT CountSub("banana", "an")`,
    cases: [
      { label: 'CountSub("banana", "an")', after: 'OUTPUT CountSub("banana", "an")' },
      { label: 'CountSub("aaaa", "aa")', after: 'OUTPUT CountSub("aaaa", "aa")' },
      { label: 'CountSub("Mississippi", "iss")', after: 'OUTPUT CountSub("Mississippi", "iss")' },
      { label: 'CountSub("Hello", "xyz")', after: 'OUTPUT CountSub("Hello", "xyz")' },
    ],
  },

  {
    id: "orig-str-07",
    title: "Countdown() — build a string in a loop",
    source: "原创 · §11.3 字符串处理",
    marks: 6,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION Countdown(Start : INTEGER) RETURNS STRING",
    prompt: [
      "A function `Countdown()` takes an integer and returns a string containing the",
      "numbers from that integer down to 1, separated by hyphen characters.",
      "",
      "For example, `Countdown(5)` returns `\"5-4-3-2-1\"`.",
      "",
      "If the integer is less than 1, the empty string is returned.",
      "",
      "Write pseudocode for the function `Countdown()`. Use `NUM_TO_STR()` to convert",
      "each number to text."
    ].join("\n"),
    model: `FUNCTION Countdown(Start : INTEGER) RETURNS STRING
    DECLARE Result : STRING
    DECLARE Number : INTEGER
    Result <- ""
    Number <- Start
    WHILE Number >= 1
        Result <- Result & NUM_TO_STR(Number)
        IF Number > 1 THEN
            Result <- Result & "-"
        ENDIF
        Number <- Number - 1
    ENDWHILE
    RETURN Result
ENDFUNCTION`,
    after: `OUTPUT "[", Countdown(5), "]"`,
    cases: [
      { label: "Countdown(5)", after: 'OUTPUT "[", Countdown(5), "]"' },
      { label: "Countdown(1)", after: 'OUTPUT "[", Countdown(1), "]"' },
      { label: "Countdown(0)", after: 'OUTPUT "[", Countdown(0), "]"' },
      { label: "Countdown(9)", after: 'OUTPUT "[", Countdown(9), "]"' },
    ],
  },

  {
    id: "orig-str-08",
    title: "NextLetter() — next letter of the alphabet",
    source: "原创 · §11.3 字符串处理",
    marks: 4,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION NextLetter(ThisChar : CHAR) RETURNS CHAR",
    prompt: [
      "A word puzzle replaces every upper-case letter with the next letter of the alphabet.",
      "`'A'` becomes `'B'` and `'Z'` becomes `'A'`.",
      "",
      "A function `NextLetter()` takes one upper-case letter and returns the letter that",
      "replaces it.",
      "",
      "For example, `NextLetter('A')` returns `'B'` and `NextLetter('Z')` returns `'A'`.",
      "",
      "Write pseudocode for the function `NextLetter()` using `ASC()` and `CHR()`."
    ].join("\n"),
    model: `FUNCTION NextLetter(ThisChar : CHAR) RETURNS CHAR
    DECLARE Code : INTEGER
    Code <- ASC(ThisChar) + 1
    IF Code > 90 THEN
        Code <- 65
    ENDIF
    RETURN CHR(Code)
ENDFUNCTION`,
    after: `OUTPUT NextLetter('A')`,
    cases: [
      { label: "NextLetter('A')", after: "OUTPUT NextLetter('A')" },
      { label: "NextLetter('M')", after: "OUTPUT NextLetter('M')" },
      { label: "NextLetter('Z')", after: "OUTPUT NextLetter('Z')" },
      { label: "NextLetter('Q')", after: "OUTPUT NextLetter('Q')" },
    ],
  },

  // ---------------------------------------------------------------------------
  // String algorithms (difficulty 2)
  // ---------------------------------------------------------------------------
  {
    id: "orig-str-09",
    title: "IsPalPhrase() — palindrome ignoring spaces",
    source: "原创 · §9.2 算法设计",
    marks: 9,
    difficulty: 2,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION IsPalPhrase(InString : STRING) RETURNS BOOLEAN",
    prompt: [
      "A phrase is a palindrome if it reads the same forwards and backwards when all space",
      "characters are ignored and upper-case and lower-case letters are treated as the same.",
      "",
      "For example, `\"Never odd or even\"` and `\"Was it a car or a cat I saw\"` are",
      "palindromes, but `\"Hello world\"` is not.",
      "",
      "A function `IsPalPhrase()` takes a phrase and returns `TRUE` if it is a palindrome,",
      "otherwise `FALSE`. The spaces must be skipped while the phrase is compared; they",
      "must not be removed from the string first.",
      "",
      "Write pseudocode for the function `IsPalPhrase()`."
    ].join("\n"),
    model: `FUNCTION IsPalPhrase(InString : STRING) RETURNS BOOLEAN
    DECLARE Left : INTEGER
    DECLARE Right : INTEGER
    DECLARE IsPal : BOOLEAN
    Left <- 1
    Right <- LENGTH(InString)
    IsPal <- TRUE
    WHILE Left < Right AND IsPal = TRUE
        WHILE Left < Right AND MID(InString, Left, 1) = ' '
            Left <- Left + 1
        ENDWHILE
        WHILE Right > Left AND MID(InString, Right, 1) = ' '
            Right <- Right - 1
        ENDWHILE
        IF TO_UPPER(MID(InString, Left, 1)) <> TO_UPPER(MID(InString, Right, 1)) THEN
            IsPal <- FALSE
        ENDIF
        Left <- Left + 1
        Right <- Right - 1
    ENDWHILE
    RETURN IsPal
ENDFUNCTION`,
    after: `OUTPUT IsPalPhrase("Never odd or even")`,
    cases: [
      { label: '"Never odd or even"', after: 'OUTPUT IsPalPhrase("Never odd or even")' },
      { label: '"Was it a car or a cat I saw"', after: 'OUTPUT IsPalPhrase("Was it a car or a cat I saw")' },
      { label: '"Hello world"', after: 'OUTPUT IsPalPhrase("Hello world")' },
      { label: '"Madam"', after: 'OUTPUT IsPalPhrase("Madam")' },
    ],
  },

  {
    id: "orig-str-10",
    title: "Reverse() — reverse a string",
    source: "原创 · §9.2 算法设计",
    marks: 8,
    difficulty: 2,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION Reverse(InString : STRING) RETURNS STRING",
    prompt: [
      "A function `Reverse()` takes a string and returns the string with its characters in",
      "reverse order.",
      "",
      "For example, `Reverse(\"Computer\")` returns `\"retupmoC\"`.",
      "",
      "The function must not use a second array. The string always contains at least one",
      "character.",
      "",
      "Write pseudocode for the function `Reverse()`."
    ].join("\n"),
    model: `FUNCTION Reverse(InString : STRING) RETURNS STRING
    DECLARE Result : STRING
    DECLARE Index : INTEGER
    Result <- ""
    FOR Index <- 1 TO LENGTH(InString)
        Result <- MID(InString, Index, 1) & Result
    NEXT Index
    RETURN Result
ENDFUNCTION`,
    after: `OUTPUT Reverse("Computer")`,
    cases: [
      { label: 'Reverse("Computer")', after: 'OUTPUT Reverse("Computer")' },
      { label: 'Reverse("A")', after: 'OUTPUT Reverse("A")' },
      { label: 'Reverse("Level")', after: 'OUTPUT Reverse("Level")' },
      { label: 'Reverse("12345")', after: 'OUTPUT Reverse("12345")' },
    ],
  },

  {
    id: "orig-str-11",
    title: "NoSpaces() — remove every space",
    source: "原创 · §9.2 算法设计",
    marks: 7,
    difficulty: 2,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION NoSpaces(InString : STRING) RETURNS STRING",
    prompt: [
      "A function `NoSpaces()` takes a string and returns the string with every space",
      "character removed. All other characters keep their original order.",
      "",
      "For example, `NoSpaces(\"A B C\")` returns `\"ABC\"`.",
      "",
      "Write pseudocode for the function `NoSpaces()`."
    ].join("\n"),
    model: `FUNCTION NoSpaces(InString : STRING) RETURNS STRING
    DECLARE Result : STRING
    DECLARE Index : INTEGER
    Result <- ""
    FOR Index <- 1 TO LENGTH(InString)
        IF MID(InString, Index, 1) <> ' ' THEN
            Result <- Result & MID(InString, Index, 1)
        ENDIF
    NEXT Index
    RETURN Result
ENDFUNCTION`,
    after: `OUTPUT "[", NoSpaces("A B C"), "]"`,
    cases: [
      { label: 'NoSpaces("A B C")', after: 'OUTPUT "[", NoSpaces("A B C"), "]"' },
      { label: 'NoSpaces("  padded  ")', after: 'OUTPUT "[", NoSpaces("  padded  "), "]"' },
      { label: 'NoSpaces("NoGaps")', after: 'OUTPUT "[", NoSpaces("NoGaps"), "]"' },
      { label: 'NoSpaces("1 2 3 4")', after: 'OUTPUT "[", NoSpaces("1 2 3 4"), "]"' },
    ],
  },

  {
    id: "orig-str-12",
    title: "ReplaceAll() — replace a character",
    source: "原创 · §11.3 字符串处理",
    marks: 7,
    difficulty: 2,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION ReplaceAll(InString : STRING, OldChar : CHAR, NewChar : CHAR) RETURNS STRING",
    prompt: [
      "A function `ReplaceAll()` takes a string and two characters. It returns a copy of the",
      "string in which every occurrence of the first character is replaced by the second",
      "character. All other characters are unchanged.",
      "",
      "The comparison is case-sensitive.",
      "",
      "For example, `ReplaceAll(\"banana\", 'a', 'o')` returns `\"bonono\"`.",
      "",
      "Write pseudocode for the function `ReplaceAll()`."
    ].join("\n"),
    model: `FUNCTION ReplaceAll(InString : STRING, OldChar : CHAR, NewChar : CHAR) RETURNS STRING
    DECLARE Result : STRING
    DECLARE Index : INTEGER
    DECLARE ThisChar : STRING
    Result <- ""
    FOR Index <- 1 TO LENGTH(InString)
        ThisChar <- MID(InString, Index, 1)
        IF ThisChar = OldChar THEN
            Result <- Result & NewChar
        ELSE
            Result <- Result & ThisChar
        ENDIF
    NEXT Index
    RETURN Result
ENDFUNCTION`,
    after: `OUTPUT ReplaceAll("banana", 'a', 'o')`,
    cases: [
      { label: "ReplaceAll(\"banana\", 'a', 'o')", after: `OUTPUT ReplaceAll("banana", 'a', 'o')` },
      { label: "ReplaceAll(\"Mississippi\", 's', 'S')", after: `OUTPUT ReplaceAll("Mississippi", 's', 'S')` },
      { label: "ReplaceAll(\"hello\", 'z', 'x')", after: `OUTPUT ReplaceAll("hello", 'z', 'x')` },
      { label: "ReplaceAll(\"aaaa\", 'a', 'b')", after: `OUTPUT ReplaceAll("aaaa", 'a', 'b')` },
    ],
  },

  {
    id: "orig-str-13",
    title: "Initials() — initials from a full name",
    source: "原创 · §11.3 字符串处理",
    marks: 8,
    difficulty: 2,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION Initials(FullName : STRING) RETURNS STRING",
    prompt: [
      "A function `Initials()` takes a full name and returns the initials of every word in",
      "upper case.",
      "",
      "The words are separated by single space characters, there are no spaces at the start",
      "or end of the name, and there is at least one word.",
      "",
      "For example, `Initials(\"ada lovelace\")` returns `\"AL\"`.",
      "",
      "Write pseudocode for the function `Initials()`."
    ].join("\n"),
    model: `FUNCTION Initials(FullName : STRING) RETURNS STRING
    DECLARE Result : STRING
    DECLARE Index : INTEGER
    Result <- TO_UPPER(MID(FullName, 1, 1))
    FOR Index <- 2 TO LENGTH(FullName)
        IF MID(FullName, Index - 1, 1) = ' ' THEN
            Result <- Result & TO_UPPER(MID(FullName, Index, 1))
        ENDIF
    NEXT Index
    RETURN Result
ENDFUNCTION`,
    after: `OUTPUT Initials("ada lovelace")`,
    cases: [
      { label: '"ada lovelace"', after: 'OUTPUT Initials("ada lovelace")' },
      { label: '"Grace Brewster Murray Hopper"', after: 'OUTPUT Initials("Grace Brewster Murray Hopper")' },
      { label: '"alan turing"', after: 'OUTPUT Initials("alan turing")' },
      { label: '"plato"', after: 'OUTPUT Initials("plato")' },
    ],
  },

  {
    id: "orig-str-14",
    title: "Expand() — run-length expansion",
    source: "原创 · §9.2 算法设计",
    marks: 8,
    difficulty: 2,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION Expand(InString : STRING) RETURNS STRING",
    prompt: [
      "A string is compressed using run-length encoding. Each run is stored as one character",
      "followed by a single digit that gives the number of times the character is repeated.",
      "For example, `\"AAABB\"` is stored as `\"A3B2\"`.",
      "",
      "A function `Expand()` takes a compressed string and returns the original string.",
      "",
      "For example, `Expand(\"A3B2\")` returns `\"AAABB\"`.",
      "",
      "Assume the compressed string is valid, has an even number of characters, and every",
      "count is a digit from 1 to 9.",
      "",
      "Write pseudocode for the function `Expand()`."
    ].join("\n"),
    model: `FUNCTION Expand(InString : STRING) RETURNS STRING
    DECLARE Result : STRING
    DECLARE Index : INTEGER
    DECLARE Inner : INTEGER
    DECLARE ThisChar : STRING
    DECLARE Count : INTEGER
    Result <- ""
    Index <- 1
    WHILE Index < LENGTH(InString)
        ThisChar <- MID(InString, Index, 1)
        Count <- STR_TO_NUM(MID(InString, Index + 1, 1))
        FOR Inner <- 1 TO Count
            Result <- Result & ThisChar
        NEXT Inner
        Index <- Index + 2
    ENDWHILE
    RETURN Result
ENDFUNCTION`,
    after: `OUTPUT Expand("A3B2")`,
    cases: [
      { label: 'Expand("A3B2")', after: 'OUTPUT Expand("A3B2")' },
      { label: 'Expand("X1Y4")', after: 'OUTPUT Expand("X1Y4")' },
      { label: 'Expand("C2C3")', after: 'OUTPUT Expand("C2C3")' },
      { label: 'Expand("Z9")', after: 'OUTPUT Expand("Z9")' },
    ],
  },

  // ---------------------------------------------------------------------------
  // Routines (difficulty 2-3)
  // ---------------------------------------------------------------------------
  {
    id: "orig-str-15",
    title: "Postage() — postage charge",
    source: "原创 · §11.1 函数与过程",
    marks: 7,
    difficulty: 2,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION Postage(Weight : INTEGER, Express : BOOLEAN) RETURNS INTEGER",
    prompt: [
      "A parcel delivery company charges postage in pence:",
      "- 200 for the first 100 grams",
      "- 90 for each additional 100 grams or part of 100 grams",
      "- an extra 350 for express delivery",
      "",
      "A function `Postage()` takes the weight of a parcel in grams and a Boolean that is",
      "`TRUE` for express delivery. It returns the postage in pence.",
      "",
      "For example, `Postage(250, FALSE)` returns 380.",
      "",
      "The weight is always at least 1 gram.",
      "",
      "Write pseudocode for the function `Postage()`."
    ].join("\n"),
    model: `FUNCTION Postage(Weight : INTEGER, Express : BOOLEAN) RETURNS INTEGER
    DECLARE Extra : INTEGER
    DECLARE Cost : INTEGER
    Extra <- (Weight - 1) DIV 100
    Cost <- 200 + Extra * 90
    IF Express = TRUE THEN
        Cost <- Cost + 350
    ENDIF
    RETURN Cost
ENDFUNCTION`,
    after: `OUTPUT Postage(250, FALSE)`,
    cases: [
      { label: "Postage(100, FALSE)", after: "OUTPUT Postage(100, FALSE)" },
      { label: "Postage(101, FALSE)", after: "OUTPUT Postage(101, FALSE)" },
      { label: "Postage(250, TRUE)", after: "OUTPUT Postage(250, TRUE)" },
      { label: "Postage(1000, FALSE)", after: "OUTPUT Postage(1000, FALSE)" },
    ],
  },

  {
    id: "orig-str-16",
    title: "ChangeDue() — split the change",
    source: "原创 · §11.1 函数与过程",
    marks: 7,
    difficulty: 2,
    chapter: "Ch11 Programming",
    requirement: "PROCEDURE ChangeDue(Paid : INTEGER, Price : INTEGER, BYREF Pounds : INTEGER, BYREF Pence : INTEGER)",
    prompt: [
      "A shop till calculates change. Both the amount paid and the price of the item are",
      "held in pence.",
      "",
      "A procedure `ChangeDue()` takes the amount paid and the price. It sets two variables",
      "in the calling program to the change in whole pounds and the remaining pence.",
      "",
      "For example, `CALL ChangeDue(500, 375, Pounds, Pence)` sets `Pounds` to 1 and",
      "`Pence` to 25.",
      "",
      "The amount paid is always at least the price.",
      "",
      "Write pseudocode for the procedure `ChangeDue()`. The two variables that hold the",
      "result must be passed by reference."
    ].join("\n"),
    model: `PROCEDURE ChangeDue(Paid : INTEGER, Price : INTEGER, BYREF Pounds : INTEGER, BYREF Pence : INTEGER)
    DECLARE Change : INTEGER
    Change <- Paid - Price
    Pounds <- Change DIV 100
    Pence <- Change MOD 100
ENDPROCEDURE`,
    setup: `DECLARE PoundsOut : INTEGER
DECLARE PenceOut : INTEGER`,
    after: `CALL ChangeDue(500, 375, PoundsOut, PenceOut)
OUTPUT PoundsOut, " ", PenceOut`,
    cases: [
      {
        label: "paid 500, price 375",
        after: `CALL ChangeDue(500, 375, PoundsOut, PenceOut)\nOUTPUT PoundsOut, " ", PenceOut`,
      },
      {
        label: "paid 1000, price 999",
        after: `CALL ChangeDue(1000, 999, PoundsOut, PenceOut)\nOUTPUT PoundsOut, " ", PenceOut`,
      },
      {
        label: "paid 200, price 200",
        after: `CALL ChangeDue(200, 200, PoundsOut, PenceOut)\nOUTPUT PoundsOut, " ", PenceOut`,
      },
      {
        label: "paid 5000, price 1234",
        after: `CALL ChangeDue(5000, 1234, PoundsOut, PenceOut)\nOUTPUT PoundsOut, " ", PenceOut`,
      },
    ],
  },

  {
    id: "orig-str-17",
    title: "ValidCode() — validate a bin code",
    source: "原创 · §11.1 函数与过程",
    marks: 8,
    difficulty: 2,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION ValidCode(Code : STRING) RETURNS BOOLEAN",
    prompt: [
      "Every item in a warehouse has a bin code made of two upper-case letters followed by",
      "four digits, for example `\"AB1234\"`.",
      "",
      "A function `ValidCode()` takes a string and returns `TRUE` if it is a valid bin code,",
      "otherwise `FALSE`. A valid bin code:",
      "- is exactly six characters long",
      "- starts with two upper-case letters",
      "- ends with four numeric characters",
      "",
      "For example, `ValidCode(\"AB1234\")` returns `TRUE` and `ValidCode(\"ab1234\")` returns",
      "`FALSE`.",
      "",
      "Write pseudocode for the function `ValidCode()`."
    ].join("\n"),
    model: `FUNCTION ValidCode(Code : STRING) RETURNS BOOLEAN
    DECLARE Index : INTEGER
    DECLARE ThisChar : STRING
    IF LENGTH(Code) <> 6 THEN
        RETURN FALSE
    ENDIF
    FOR Index <- 1 TO 2
        ThisChar <- MID(Code, Index, 1)
        IF ThisChar < "A" OR ThisChar > "Z" THEN
            RETURN FALSE
        ENDIF
    NEXT Index
    FOR Index <- 3 TO 6
        IF NOT IS_NUM(MID(Code, Index, 1)) THEN
            RETURN FALSE
        ENDIF
    NEXT Index
    RETURN TRUE
ENDFUNCTION`,
    after: `OUTPUT ValidCode("AB1234")`,
    cases: [
      { label: '"AB1234"', after: 'OUTPUT ValidCode("AB1234")' },
      { label: '"A12345"', after: 'OUTPUT ValidCode("A12345")' },
      { label: '"ab1234"', after: 'OUTPUT ValidCode("ab1234")' },
      { label: '"AB123"', after: 'OUTPUT ValidCode("AB123")' },
    ],
  },

  {
    id: "orig-str-18",
    title: "Widen() — double every digit",
    source: "原创 · §11.1 函数与过程",
    marks: 8,
    difficulty: 2,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION Widen(Number : INTEGER) RETURNS INTEGER",
    prompt: [
      "A number puzzle doubles every digit of a number and joins the results in the same",
      "order to make a new number.",
      "",
      "For example, 123 becomes 246 because 1, 2 and 3 become 2, 4 and 6. 59 becomes 1018",
      "because 5 and 9 become 10 and 18.",
      "",
      "A function `Widen()` takes a positive integer and returns the new integer. It must",
      "convert the number to text using `NUM_TO_STR()` and convert the result back using",
      "`STR_TO_NUM()`.",
      "",
      "Write pseudocode for the function `Widen()`."
    ].join("\n"),
    model: `FUNCTION Widen(Number : INTEGER) RETURNS INTEGER
    DECLARE Text : STRING
    DECLARE Result : STRING
    DECLARE Digit : INTEGER
    DECLARE Index : INTEGER
    Text <- NUM_TO_STR(Number)
    Result <- ""
    FOR Index <- 1 TO LENGTH(Text)
        Digit <- STR_TO_NUM(MID(Text, Index, 1))
        Result <- Result & NUM_TO_STR(Digit * 2)
    NEXT Index
    RETURN STR_TO_NUM(Result)
ENDFUNCTION`,
    after: `OUTPUT Widen(123)`,
    cases: [
      { label: "Widen(123)", after: "OUTPUT Widen(123)" },
      { label: "Widen(59)", after: "OUTPUT Widen(59)" },
      { label: "Widen(70)", after: "OUTPUT Widen(70)" },
      { label: "Widen(406)", after: "OUTPUT Widen(406)" },
    ],
  },

  {
    id: "orig-str-19",
    title: "DigitSum() — recursive digit total",
    source: "原创 · §9.2 递归算法",
    marks: 8,
    difficulty: 3,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION DigitSum(Number : INTEGER) RETURNS INTEGER",
    prompt: [
      "The sum of the digits of a number is found by adding its digits, for example the sum",
      "of the digits of 4729 is 22.",
      "",
      "A recursive function `DigitSum()` takes an integer and returns the sum of its digits:",
      "- if the number is negative, it returns −1",
      "- if the number is a single digit, it returns the number",
      "- otherwise it returns the last digit added to the sum of the digits of the rest of",
      "  the number",
      "",
      "The function must call itself.",
      "",
      "Write pseudocode for the recursive function `DigitSum()`."
    ].join("\n"),
    model: `FUNCTION DigitSum(Number : INTEGER) RETURNS INTEGER
    IF Number < 0 THEN
        RETURN -1
    ENDIF
    IF Number < 10 THEN
        RETURN Number
    ENDIF
    RETURN (Number MOD 10) + DigitSum(Number DIV 10)
ENDFUNCTION`,
    after: `OUTPUT DigitSum(4729)`,
    cases: [
      { label: "DigitSum(4729)", after: "OUTPUT DigitSum(4729)" },
      { label: "DigitSum(8)", after: "OUTPUT DigitSum(8)" },
      { label: "DigitSum(1000)", after: "OUTPUT DigitSum(1000)" },
      { label: "DigitSum(-25)", after: "OUTPUT DigitSum(-25)" },
    ],
  },

  {
    id: "orig-str-20",
    title: "GCD() — recursive greatest common divisor",
    source: "原创 · §9.2 递归算法",
    marks: 8,
    difficulty: 3,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION GCD(A : INTEGER, B : INTEGER) RETURNS INTEGER",
    prompt: [
      "The greatest common divisor (GCD) of two positive integers is the largest integer",
      "that divides exactly into both of them. For example, the GCD of 48 and 18 is 6.",
      "",
      "A recursive function `GCD()` takes two positive integers and returns their GCD:",
      "- if `A` is 0, it returns `B`",
      "- if `B` is 0, it returns `A`",
      "- otherwise it returns `GCD(B, A MOD B)`",
      "",
      "The function must call itself.",
      "",
      "Write pseudocode for the recursive function `GCD()`."
    ].join("\n"),
    model: `FUNCTION GCD(A : INTEGER, B : INTEGER) RETURNS INTEGER
    IF A = 0 THEN
        RETURN B
    ENDIF
    IF B = 0 THEN
        RETURN A
    ENDIF
    RETURN GCD(B, A MOD B)
ENDFUNCTION`,
    after: `OUTPUT GCD(48, 18)`,
    cases: [
      { label: "GCD(48, 18)", after: "OUTPUT GCD(48, 18)" },
      { label: "GCD(17, 5)", after: "OUTPUT GCD(17, 5)" },
      { label: "GCD(100, 75)", after: "OUTPUT GCD(100, 75)" },
      { label: "GCD(7, 7)", after: "OUTPUT GCD(7, 7)" },
    ],
  },
];
