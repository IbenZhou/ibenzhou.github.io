// Original Cambridge 9618 questions written for this bank.
// New scenarios in exam style; not past-paper questions.
//
// Searching and sorting. Every case supplies its own setup block so the array
// contents differ; `after` prints the stored result, or CALLs the routine and
// then prints the array that the routine changed.

const MARK = "===RESULT===";

function intSetup(name, values) {
  let code = `DECLARE ${name} : ARRAY[1:${values.length}] OF INTEGER\n`;
  values.forEach((value, index) => {
    code += `${name}[${index + 1}] <- ${value}\n`;
  });
  return code;
}

function textSetup(name, values) {
  let code = `DECLARE ${name} : ARRAY[1:${values.length}] OF STRING\n`;
  values.forEach((value, index) => {
    code += `${name}[${index + 1}] <- "${value}"\n`;
  });
  return code;
}

function withValue(setup, name, value) {
  return `${setup}DECLARE ${name} : INTEGER\n${name} <- ${value}\n`;
}

function withInt(setup, name) {
  return `${setup}DECLARE ${name} : INTEGER\n`;
}

function callThenPrint(call, name, count) {
  return `OUTPUT "${MARK}"
${call}
DECLARE PrintIndex : INTEGER
FOR PrintIndex <- 1 TO ${count}
    OUTPUT ${name}[PrintIndex]
NEXT PrintIndex`;
}

function printResult(expression) {
  return `OUTPUT "${MARK}"
OUTPUT ${expression}`;
}

export const ALGOS = [
  // ------------------------------------------------------------- linear search
  {
    id: "orig-linear-first-index",
    title: "FindParcel() — first matching shelf position",
    source: "原创 · §9.2 线性查找",
    marks: 7,
    difficulty: 2,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION FindParcel(Shelf : ARRAY[1:8] OF INTEGER, Code : INTEGER) RETURNS INTEGER",
    prompt: [
      "Eight parcel codes are stored on one shelf in the 1D integer array `Shelf`,",
      "declared as `ARRAY[1:8] OF INTEGER`. The codes are in no particular order and",
      "the same code may appear more than once.",
      "",
      "A function `FindParcel()` takes the array and one parcel code. It performs a",
      "**linear search** and returns the index of the **first** element that holds the",
      "code. It returns `-1` if the code does not occur.",
      "",
      "For example, if `Shelf` holds `21, 34, 18, 45, 34, 60, 27, 52`, then",
      "`FindParcel(Shelf, 34)` returns `2`.",
      "",
      "Write pseudocode for `FindParcel()`. Your search must stop at the first match,",
      "so no later element is examined once the code has been found."
    ].join("\n"),
    model: `FUNCTION FindParcel(Shelf : ARRAY[1:8] OF INTEGER, Code : INTEGER) RETURNS INTEGER
    DECLARE Index : INTEGER
    DECLARE Found : BOOLEAN
    DECLARE Position : INTEGER
    Index <- 1
    Found <- FALSE
    Position <- -1
    WHILE Found = FALSE AND Index <= 8
        IF Shelf[Index] = Code THEN
            Found <- TRUE
            Position <- Index
        ELSE
            Index <- Index + 1
        ENDIF
    ENDWHILE
    RETURN Position
ENDFUNCTION`,
    after: printResult("FindParcel(Shelf, Code)"),
    cases: [
      { label: "34 twice, first at 2", setup: withValue(intSetup("Shelf", [21, 34, 18, 45, 34, 60, 27, 52]), "Code", 34) },
      { label: "55 at the end", setup: withValue(intSetup("Shelf", [7, 12, 19, 24, 31, 40, 55, 68]), "Code", 55) },
      { label: "11 not present", setup: withValue(intSetup("Shelf", [90, 81, 72, 63, 54, 45, 36, 27]), "Code", 11) },
      { label: "5 three times, first at 1", setup: withValue(intSetup("Shelf", [5, 9, 5, 12, 5, 20, 24, 30]), "Code", 5) },
    ],
  },

  {
    id: "orig-linear-count-matches",
    title: "CountMatches() — count every matching value",
    source: "原创 · §9.2 线性查找",
    marks: 7,
    difficulty: 2,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION CountMatches(Lengths : ARRAY[1:8] OF INTEGER, Target : INTEGER) RETURNS INTEGER",
    prompt: [
      "A swimming club records the number of lengths completed by eight swimmers in the",
      "1D integer array `Lengths`, declared as `ARRAY[1:8] OF INTEGER`.",
      "",
      "A function `CountMatches()` takes the array and a target number of lengths. It",
      "uses a **linear search** to count how many elements of the array are equal to the",
      "target, and returns that count. It returns `0` if no element matches.",
      "",
      "For example, if `Lengths` holds `12, 7, 12, 19, 12, 8, 12, 3`, then",
      "`CountMatches(Lengths, 12)` returns `4`.",
      "",
      "Write pseudocode for `CountMatches()`. The whole array must be examined, even",
      "after a match has been found."
    ].join("\n"),
    model: `FUNCTION CountMatches(Lengths : ARRAY[1:8] OF INTEGER, Target : INTEGER) RETURNS INTEGER
    DECLARE Index : INTEGER
    DECLARE Total : INTEGER
    Total <- 0
    FOR Index <- 1 TO 8
        IF Lengths[Index] = Target THEN
            Total <- Total + 1
        ENDIF
    NEXT Index
    RETURN Total
ENDFUNCTION`,
    after: printResult("CountMatches(Lengths, Target)"),
    cases: [
      { label: "four 12s", setup: withValue(intSetup("Lengths", [12, 7, 12, 19, 12, 8, 12, 3]), "Target", 12) },
      { label: "every value is 5", setup: withValue(intSetup("Lengths", [5, 5, 5, 5, 5, 5, 5, 5]), "Target", 5) },
      { label: "three 9s", setup: withValue(intSetup("Lengths", [3, 9, 14, 9, 21, 9, 2, 7]), "Target", 9) },
      { label: "no match", setup: withValue(intSetup("Lengths", [4, 8, 15, 16, 23, 42, 7, 1]), "Target", 10) },
    ],
  },

  {
    id: "orig-linear-first-in-range",
    title: "FirstInRange() — first reading inside the band",
    source: "原创 · §9.2 线性查找",
    marks: 8,
    difficulty: 2,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION FirstInRange(Readings : ARRAY[1:8] OF INTEGER, Low : INTEGER, High : INTEGER) RETURNS INTEGER",
    prompt: [
      "A greenhouse stores eight temperature readings in the 1D integer array",
      "`Readings`, declared as `ARRAY[1:8] OF INTEGER`. The readings are not stored in",
      "any order.",
      "",
      "A function `FirstInRange()` takes the array and the two ends of a comfort band,",
      "`Low` and `High`. It performs a **linear search** and returns the index of the",
      "first reading that is greater than or equal to `Low` **and** less than or equal",
      "to `High`. It returns `-1` if no reading is inside the band.",
      "",
      "For example, with `Readings` holding `3, 8, 12, 19, 6, 21, 25, 9`,",
      "`FirstInRange(Readings, 10, 20)` returns `3`.",
      "",
      "Write pseudocode for `FirstInRange()`. The search must stop at the first reading",
      "that is inside the band."
    ].join("\n"),
    model: `FUNCTION FirstInRange(Readings : ARRAY[1:8] OF INTEGER, Low : INTEGER, High : INTEGER) RETURNS INTEGER
    DECLARE Index : INTEGER
    DECLARE Found : BOOLEAN
    DECLARE Position : INTEGER
    Index <- 1
    Found <- FALSE
    Position <- -1
    WHILE Found = FALSE AND Index <= 8
        IF Readings[Index] >= Low AND Readings[Index] <= High THEN
            Found <- TRUE
            Position <- Index
        ELSE
            Index <- Index + 1
        ENDIF
    ENDWHILE
    RETURN Position
ENDFUNCTION`,
    after: printResult("FirstInRange(Readings, Low, High)"),
    cases: [
      { label: "band 10 to 20", setup: `${intSetup("Readings", [3, 8, 12, 19, 6, 21, 25, 9])}DECLARE Low : INTEGER\nDECLARE High : INTEGER\nLow <- 10\nHigh <- 20` },
      { label: "band 11 to 15", setup: `${intSetup("Readings", [2, 4, 6, 8, 10, 12, 14, 16])}DECLARE Low : INTEGER\nDECLARE High : INTEGER\nLow <- 11\nHigh <- 15` },
      { label: "band 21 to 23, descending data", setup: `${intSetup("Readings", [30, 28, 26, 24, 22, 20, 18, 16])}DECLARE Low : INTEGER\nDECLARE High : INTEGER\nLow <- 21\nHigh <- 23` },
      { label: "band 9 to 12, no reading", setup: `${intSetup("Readings", [1, 2, 3, 4, 5, 6, 7, 8])}DECLARE Low : INTEGER\nDECLARE High : INTEGER\nLow <- 9\nHigh <- 12` },
    ],
  },

  {
    id: "orig-linear-strings",
    title: "FindRoom() — search an array of room names",
    source: "原创 · §9.2 线性查找",
    marks: 8,
    difficulty: 2,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION FindRoom(Rooms : ARRAY[1:7] OF STRING, Wanted : STRING) RETURNS INTEGER",
    prompt: [
      "A hotel stores the names of its seven function rooms in the 1D string array",
      "`Rooms`, declared as `ARRAY[1:7] OF STRING`, in the order in which the rooms were",
      "added to the list. The names are **not** in alphabetical order.",
      "",
      "A function `FindRoom()` takes the array and a room name. It performs a **linear",
      "search** and returns the index of the element that is exactly equal to the room",
      "name. It returns `-1` if the room is not in the array. A room name is stored",
      "exactly as it is searched for, so no case conversion is needed.",
      "",
      "For example, if `Rooms` holds `\"Birch\", \"Cedar\", \"Elm\", \"Maple\", \"Oak\",",
      "\"Pine\", \"Willow\"`, then `FindRoom(Rooms, \"Maple\")` returns `4`.",
      "",
      "Write pseudocode for `FindRoom()`."
    ].join("\n"),
    model: `FUNCTION FindRoom(Rooms : ARRAY[1:7] OF STRING, Wanted : STRING) RETURNS INTEGER
    DECLARE Index : INTEGER
    DECLARE Found : BOOLEAN
    DECLARE Position : INTEGER
    Index <- 1
    Found <- FALSE
    Position <- -1
    WHILE Found = FALSE AND Index <= 7
        IF Rooms[Index] = Wanted THEN
            Found <- TRUE
            Position <- Index
        ELSE
            Index <- Index + 1
        ENDIF
    ENDWHILE
    RETURN Position
ENDFUNCTION`,
    after: printResult("FindRoom(Rooms, Wanted)"),
    cases: [
      {
        label: "\"Maple\" at 4",
        setup: `${textSetup("Rooms", ["Birch", "Cedar", "Elm", "Maple", "Oak", "Pine", "Willow"])}DECLARE Wanted : STRING\nWanted <- "Maple"`,
      },
      {
        label: "\"Yew\" at 7",
        setup: `${textSetup("Rooms", ["Alder", "Beech", "Hazel", "Larch", "Rowan", "Sycamore", "Yew"])}DECLARE Wanted : STRING\nWanted <- "Yew"`,
      },
      {
        label: "\"Oak\" not present",
        setup: `${textSetup("Rooms", ["Ash", "Fir", "Holly", "Lime", "Pear", "Plum", "Quince"])}DECLARE Wanted : STRING\nWanted <- "Oak"`,
      },
      {
        label: "\"Cove\" at 1",
        setup: `${textSetup("Rooms", ["Cove", "Dune", "Fern", "Glen", "Heath", "Marsh", "Ridge"])}DECLARE Wanted : STRING\nWanted <- "Cove"`,
      },
    ],
  },

  // ------------------------------------------------------------- binary search
  {
    id: "orig-binary-index",
    title: "BinFind() — binary search for a serial number",
    source: "原创 · §9.2 二分查找",
    marks: 9,
    difficulty: 2,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION BinFind(Serials : ARRAY[1:8] OF INTEGER, Target : INTEGER) RETURNS INTEGER",
    prompt: [
      "A repair centre stores eight appliance serial numbers in ascending order in the",
      "1D integer array `Serials`, declared as `ARRAY[1:8] OF INTEGER`.",
      "",
      "A function `BinFind()` takes the array and a serial number. It performs a",
      "**binary search** and returns the index of the element that is equal to the",
      "serial number. It returns `-1` if the serial number is not in the array.",
      "",
      "For example, with `Serials` holding `14, 27, 35, 48, 53, 66, 71, 90`,",
      "`BinFind(Serials, 53)` returns `5`.",
      "",
      "Write pseudocode for `BinFind()`. You may assume that the array is always in",
      "ascending order and that no serial number is repeated."
    ].join("\n"),
    model: `FUNCTION BinFind(Serials : ARRAY[1:8] OF INTEGER, Target : INTEGER) RETURNS INTEGER
    DECLARE Low : INTEGER
    DECLARE High : INTEGER
    DECLARE Mid : INTEGER
    DECLARE Position : INTEGER
    DECLARE Found : BOOLEAN
    Low <- 1
    High <- 8
    Position <- -1
    Found <- FALSE
    WHILE Low <= High AND Found = FALSE
        Mid <- (Low + High) DIV 2
        IF Serials[Mid] = Target THEN
            Found <- TRUE
            Position <- Mid
        ELSE
            IF Serials[Mid] < Target THEN
                Low <- Mid + 1
            ELSE
                High <- Mid - 1
            ENDIF
        ENDIF
    ENDWHILE
    RETURN Position
ENDFUNCTION`,
    after: printResult("BinFind(Serials, Target)"),
    cases: [
      { label: "53 in the middle", setup: withValue(intSetup("Serials", [14, 27, 35, 48, 53, 66, 71, 90]), "Target", 53) },
      { label: "2 at the first position", setup: withValue(intSetup("Serials", [2, 5, 9, 16, 23, 38, 41, 57]), "Target", 2) },
      { label: "99 not present", setup: withValue(intSetup("Serials", [11, 22, 33, 44, 55, 66, 77, 88]), "Target", 99) },
      { label: "45 at the last position", setup: withValue(intSetup("Serials", [3, 6, 10, 15, 21, 28, 36, 45]), "Target", 45) },
    ],
  },

  {
    id: "orig-binary-comparison-count",
    title: "CountComps() — how many comparisons did it take?",
    source: "原创 · §9.2 二分查找",
    marks: 9,
    difficulty: 2,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION CountComps(Data : ARRAY[1:8] OF INTEGER, Target : INTEGER) RETURNS INTEGER",
    prompt: [
      "A data logger stores eight readings in ascending order in the 1D integer array",
      "`Data`, declared as `ARRAY[1:8] OF INTEGER`. The logger counts how much work each",
      "search does.",
      "",
      "A function `CountComps()` takes the array and a target value. It performs a",
      "**binary search** and returns the number of comparisons that were needed to find",
      "the target. It returns `-1` if the target is not in the array.",
      "",
      "One comparison is counted for each pass of the search loop. In a pass, the",
      "value of `Data[Mid]` is compared with `Target` and the search then continues",
      "in the left half or in the right half. Once the target has been found, no",
      "further comparison is counted.",
      "",
      "For example, with `Data` holding `14, 27, 35, 48, 53, 66, 71, 90`,",
      "`CountComps(Data, 53)` returns `3`.",
      "",
      "Write pseudocode for `CountComps()`. You may assume that the array is always in",
      "ascending order and that no value is repeated."
    ].join("\n"),
    model: `FUNCTION CountComps(Data : ARRAY[1:8] OF INTEGER, Target : INTEGER) RETURNS INTEGER
    DECLARE Low : INTEGER
    DECLARE High : INTEGER
    DECLARE Mid : INTEGER
    DECLARE Count : INTEGER
    DECLARE Found : BOOLEAN
    Low <- 1
    High <- 8
    Count <- 0
    Found <- FALSE
    WHILE Low <= High AND Found = FALSE
        Mid <- (Low + High) DIV 2
        Count <- Count + 1
        IF Data[Mid] = Target THEN
            Found <- TRUE
        ELSE
            IF Data[Mid] < Target THEN
                Low <- Mid + 1
            ELSE
                High <- Mid - 1
            ENDIF
        ENDIF
    ENDWHILE
    IF Found = TRUE THEN
        RETURN Count
    ELSE
        RETURN -1
    ENDIF
ENDFUNCTION`,
    after: printResult("CountComps(Data, Target)"),
    cases: [
      { label: "53 found in 3", setup: withValue(intSetup("Data", [14, 27, 35, 48, 53, 66, 71, 90]), "Target", 53) },
      { label: "4 found in 3", setup: withValue(intSetup("Data", [4, 9, 15, 22, 30, 41, 57, 68]), "Target", 4) },
      { label: "72 found in 4", setup: withValue(intSetup("Data", [6, 13, 20, 28, 37, 49, 58, 72]), "Target", 72) },
      { label: "42 absent", setup: withValue(intSetup("Data", [8, 17, 26, 35, 44, 53, 62, 71]), "Target", 42) },
    ],
  },

  {
    id: "orig-binary-insert-position",
    title: "InsertPos() — where the new value belongs",
    source: "原创 · §9.2 二分查找",
    marks: 8,
    difficulty: 2,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION InsertPos(Data : ARRAY[1:8] OF INTEGER, NewValue : INTEGER) RETURNS INTEGER",
    prompt: [
      "A vacancy tracker keeps eight room numbers in ascending order in the 1D integer",
      "array `Data`, declared as `ARRAY[1:8] OF INTEGER`. The array is full, but the",
      "program needs to know where a new room number would be placed.",
      "",
      "A function `InsertPos()` takes the array and the new value. It uses a **binary",
      "search** and returns the index at which the new value would be inserted so that",
      "the array stays in ascending order. The index returned is in the range `1` to",
      "`9`, where `9` means the new value would be placed after the last element.",
      "",
      "For example, with `Data` holding `10, 20, 30, 40, 50, 60, 70, 80`,",
      "`InsertPos(Data, 35)` returns `4`.",
      "",
      "Write pseudocode for `InsertPos()`. You may assume that the array is always in",
      "ascending order and that the new value is not already in the array."
    ].join("\n"),
    model: `FUNCTION InsertPos(Data : ARRAY[1:8] OF INTEGER, NewValue : INTEGER) RETURNS INTEGER
    DECLARE Low : INTEGER
    DECLARE High : INTEGER
    DECLARE Mid : INTEGER
    Low <- 1
    High <- 8
    WHILE Low <= High
        Mid <- (Low + High) DIV 2
        IF Data[Mid] < NewValue THEN
            Low <- Mid + 1
        ELSE
            High <- Mid - 1
        ENDIF
    ENDWHILE
    RETURN Low
ENDFUNCTION`,
    after: printResult("InsertPos(Data, NewValue)"),
    cases: [
      { label: "35 goes to 4", setup: withValue(intSetup("Data", [10, 20, 30, 40, 50, 60, 70, 80]), "NewValue", 35) },
      { label: "5 goes before 12", setup: withValue(intSetup("Data", [12, 25, 31, 47, 58, 63, 79, 84]), "NewValue", 5) },
      { label: "90 goes after the end", setup: withValue(intSetup("Data", [16, 24, 38, 45, 52, 61, 73, 88]), "NewValue", 90) },
      { label: "30 goes to 7", setup: withValue(intSetup("Data", [4, 9, 14, 19, 24, 29, 34, 39]), "NewValue", 30) },
    ],
  },

  {
    id: "orig-binary-strings",
    title: "FindSurname() — binary search on names",
    source: "原创 · §9.2 二分查找",
    marks: 10,
    difficulty: 2,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION FindSurname(Surnames : ARRAY[1:8] OF STRING, Who : STRING) RETURNS INTEGER",
    prompt: [
      "A school stores eight surnames in alphabetical order in the 1D string array",
      "`Surnames`, declared as `ARRAY[1:8] OF STRING`. Surnames are compared as strings,",
      "so `\"Carr\"` is less than `\"Dodd\"`.",
      "",
      "A function `FindSurname()` takes the array and a surname. It performs a **binary",
      "search** and returns the index of the element that is equal to the surname. It",
      "returns `-1` if the surname is not in the array.",
      "",
      "For example, with `Surnames` holding `\"Adams\", \"Baker\", \"Clarke\", \"Davies\",",
      "\"Evans\", \"Hughes\", \"Morgan\", \"Wright\"`, `FindSurname(Surnames, \"Davies\")`",
      "returns `4`.",
      "",
      "Write pseudocode for `FindSurname()`. You may assume that the array is always in",
      "alphabetical order and that no surname is repeated."
    ].join("\n"),
    model: `FUNCTION FindSurname(Surnames : ARRAY[1:8] OF STRING, Who : STRING) RETURNS INTEGER
    DECLARE Low : INTEGER
    DECLARE High : INTEGER
    DECLARE Mid : INTEGER
    DECLARE Position : INTEGER
    DECLARE Found : BOOLEAN
    Low <- 1
    High <- 8
    Position <- -1
    Found <- FALSE
    WHILE Low <= High AND Found = FALSE
        Mid <- (Low + High) DIV 2
        IF Surnames[Mid] = Who THEN
            Found <- TRUE
            Position <- Mid
        ELSE
            IF Surnames[Mid] < Who THEN
                Low <- Mid + 1
            ELSE
                High <- Mid - 1
            ENDIF
        ENDIF
    ENDWHILE
    RETURN Position
ENDFUNCTION`,
    after: printResult("FindSurname(Surnames, Who)"),
    cases: [
      {
        label: "\"Davies\" at 4",
        setup: `${textSetup("Surnames", ["Adams", "Baker", "Clarke", "Davies", "Evans", "Hughes", "Morgan", "Wright"])}DECLARE Who : STRING\nWho <- "Davies"`,
      },
      {
        label: "\"Reid\" at 8",
        setup: `${textSetup("Surnames", ["Allen", "Brady", "Costa", "Dunn", "Frost", "Gray", "Noble", "Reid"])}DECLARE Who : STRING\nWho <- "Reid"`,
      },
      {
        label: "\"Kane\" at 5",
        setup: `${textSetup("Surnames", ["Best", "Carr", "Dodd", "Hale", "Kane", "Page", "Shaw", "Wood"])}DECLARE Who : STRING\nWho <- "Kane"`,
      },
      {
        label: "\"Brown\" not present",
        setup: `${textSetup("Surnames", ["Boyd", "Chad", "Fell", "Holt", "Lyons", "Reid", "Todd", "Young"])}DECLARE Who : STRING\nWho <- "Brown"`,
      },
    ],
  },

  // ------------------------------------------------------------------ sorting
  {
    id: "orig-bubble-swap-count",
    title: "BubbleUp() — sort the marks and count the swaps",
    source: "原创 · §9.2 冒泡排序",
    marks: 8,
    difficulty: 2,
    chapter: "Ch09 Algorithm design",
    requirement: "PROCEDURE BubbleUp(BYREF Marks : ARRAY[1:8] OF INTEGER, BYREF SwapCount : INTEGER)",
    prompt: [
      "A class of eight students has a test mark stored in the 1D integer array `Marks`,",
      "declared as `ARRAY[1:8] OF INTEGER`. The marks are in no particular order.",
      "",
      "A procedure `BubbleUp()` takes the array and an integer. It uses a **bubble",
      "sort** to put the marks into ascending order and stores the number of swaps it",
      "made in `SwapCount`.",
      "",
      "Both values must be available to the calling program after the procedure ends.",
      "The procedure produces no output.",
      "",
      "For example, if `Marks` holds `5, 3, 9, 1, 7, 2, 8, 6`, then after the call the",
      "array holds `1, 2, 3, 5, 6, 7, 8, 9` and `SwapCount` holds `13`.",
      "",
      "Write pseudocode for `BubbleUp()`."
    ].join("\n"),
    model: `PROCEDURE BubbleUp(BYREF Marks : ARRAY[1:8] OF INTEGER, BYREF SwapCount : INTEGER)
    DECLARE Pass : INTEGER
    DECLARE Index : INTEGER
    DECLARE Temp : INTEGER
    SwapCount <- 0
    FOR Pass <- 1 TO 7
        FOR Index <- 1 TO 8 - Pass
            IF Marks[Index] > Marks[Index + 1] THEN
                Temp <- Marks[Index]
                Marks[Index] <- Marks[Index + 1]
                Marks[Index + 1] <- Temp
                SwapCount <- SwapCount + 1
            ENDIF
        NEXT Index
    NEXT Pass
ENDPROCEDURE`,
    after: `${callThenPrint("CALL BubbleUp(Marks, SwapCount)", "Marks", 8)}
OUTPUT "Swaps: ", SwapCount`,
    cases: [
      { label: "5 3 9 1 7 2 8 6 — 13 swaps", setup: withInt(intSetup("Marks", [5, 3, 9, 1, 7, 2, 8, 6]), "SwapCount") },
      { label: "already in order — 0 swaps", setup: withInt(intSetup("Marks", [2, 4, 6, 8, 10, 12, 14, 16]), "SwapCount") },
      { label: "reverse order — 28 swaps", setup: withInt(intSetup("Marks", [8, 7, 6, 5, 4, 3, 2, 1]), "SwapCount") },
      { label: "repeated marks", setup: withInt(intSetup("Marks", [4, 4, 3, 2, 4, 1, 2, 4]), "SwapCount") },
    ],
  },

  {
    id: "orig-bubble-descending",
    title: "SortDesc() — league table, highest first",
    source: "原创 · §9.2 冒泡排序",
    marks: 7,
    difficulty: 2,
    chapter: "Ch09 Algorithm design",
    requirement: "PROCEDURE SortDesc(BYREF Laps : ARRAY[1:8] OF INTEGER)",
    prompt: [
      "A karting track records the best lap time in seconds of eight drivers in the 1D",
      "integer array `Laps`, declared as `ARRAY[1:8] OF INTEGER`. The times are in no",
      "particular order and a time may be repeated.",
      "",
      "A procedure `SortDesc()` takes the array and uses a **bubble sort** to put the",
      "lap times into **descending** order, so that the slowest time is first. The sorted",
      "array must be available to the calling program after the procedure ends. The",
      "procedure produces no output.",
      "",
      "For example, if `Laps` holds `42, 17, 63, 8, 55, 29, 71, 36`, then after the call",
      "the array holds `71, 63, 55, 42, 36, 29, 17, 8`.",
      "",
      "Write pseudocode for `SortDesc()`."
    ].join("\n"),
    model: `PROCEDURE SortDesc(BYREF Laps : ARRAY[1:8] OF INTEGER)
    DECLARE Pass : INTEGER
    DECLARE Index : INTEGER
    DECLARE Temp : INTEGER
    FOR Pass <- 1 TO 7
        FOR Index <- 1 TO 8 - Pass
            IF Laps[Index] < Laps[Index + 1] THEN
                Temp <- Laps[Index]
                Laps[Index] <- Laps[Index + 1]
                Laps[Index + 1] <- Temp
            ENDIF
        NEXT Index
    NEXT Pass
ENDPROCEDURE`,
    after: callThenPrint("CALL SortDesc(Laps)", "Laps", 8),
    cases: [
      { label: "unsorted times", setup: intSetup("Laps", [42, 17, 63, 8, 55, 29, 71, 36]) },
      { label: "ascending times", setup: intSetup("Laps", [1, 2, 3, 4, 5, 6, 7, 8]) },
      { label: "repeated times", setup: intSetup("Laps", [25, 25, 14, 39, 25, 7, 39, 18]) },
      { label: "two low times at the end", setup: intSetup("Laps", [90, 12, 45, 12, 78, 3, 56, 21]) },
    ],
  },

  {
    id: "orig-insertion-ascending",
    title: "InsertionSort() — sort the bus arrivals",
    source: "原创 · §9.2 插入排序",
    marks: 8,
    difficulty: 2,
    chapter: "Ch09 Algorithm design",
    requirement: "PROCEDURE InsertionSort(BYREF Arrivals : ARRAY[1:7] OF INTEGER)",
    prompt: [
      "A bus stop display stores the minutes until each of seven buses arrives in the 1D",
      "integer array `Arrivals`, declared as `ARRAY[1:7] OF INTEGER`. The values are in no",
      "particular order.",
      "",
      "A procedure `InsertionSort()` takes the array and uses an **insertion sort** to",
      "put the values into ascending order. The sorted array must be available to the",
      "calling program after the procedure ends. The procedure produces no output.",
      "",
      "For example, if `Arrivals` holds `31, 12, 45, 7, 22, 38, 15`, then after the call",
      "the array holds `7, 12, 15, 22, 31, 38, 45`.",
      "",
      "Write pseudocode for `InsertionSort()`. Each element must be placed in its",
      "correct position among the elements before it, one element at a time."
    ].join("\n"),
    model: `PROCEDURE InsertionSort(BYREF Arrivals : ARRAY[1:7] OF INTEGER)
    DECLARE ThisItem : INTEGER
    DECLARE Place : INTEGER
    DECLARE Index : INTEGER
    FOR Index <- 2 TO 7
        ThisItem <- Arrivals[Index]
        Place <- Index - 1
        WHILE Place >= 1 AND Arrivals[Place] > ThisItem
            Arrivals[Place + 1] <- Arrivals[Place]
            Place <- Place - 1
        ENDWHILE
        Arrivals[Place + 1] <- ThisItem
    NEXT Index
ENDPROCEDURE`,
    after: callThenPrint("CALL InsertionSort(Arrivals)", "Arrivals", 7),
    cases: [
      { label: "unsorted", setup: intSetup("Arrivals", [31, 12, 45, 7, 22, 38, 15]) },
      { label: "reverse order", setup: intSetup("Arrivals", [6, 5, 4, 3, 2, 1, 0]) },
      { label: "already in order", setup: intSetup("Arrivals", [10, 20, 30, 40, 50, 60, 70]) },
      { label: "repeated values", setup: intSetup("Arrivals", [4, 9, 4, 1, 9, 2, 1]) },
    ],
  },

  {
    id: "orig-insertion-strings",
    title: "SortNames() — insertion sort of a register",
    source: "原创 · §9.2 插入排序",
    marks: 7,
    difficulty: 2,
    chapter: "Ch09 Algorithm design",
    requirement: "PROCEDURE SortNames(BYREF Names : ARRAY[1:7] OF STRING)",
    prompt: [
      "A register stores seven surnames in the 1D string array `Names`, declared as",
      "`ARRAY[1:7] OF STRING`. The names are in the order in which the people joined,",
      "so they are not alphabetical, and a surname may occur more than once.",
      "",
      "A procedure `SortNames()` takes the array and uses an **insertion sort** to put",
      "the names into ascending alphabetical order. The sorted array must be available",
      "to the calling program after the procedure ends. The procedure produces no",
      "output.",
      "",
      "For example, if `Names` holds `\"Olsen\", \"Baker\", \"Nguyen\", \"Adams\",",
      "\"Patel\", \"Clark\", \"Young\"`, then after the call the array holds `\"Adams\",",
      "\"Baker\", \"Clark\", \"Nguyen\", \"Olsen\", \"Patel\", \"Young\"`.",
      "",
      "Write pseudocode for `SortNames()`. Surnames are compared with the normal string",
      "comparison operators."
    ].join("\n"),
    model: `PROCEDURE SortNames(BYREF Names : ARRAY[1:7] OF STRING)
    DECLARE ThisName : STRING
    DECLARE Place : INTEGER
    DECLARE Index : INTEGER
    FOR Index <- 2 TO 7
        ThisName <- Names[Index]
        Place <- Index - 1
        WHILE Place >= 1 AND Names[Place] > ThisName
            Names[Place + 1] <- Names[Place]
            Place <- Place - 1
        ENDWHILE
        Names[Place + 1] <- ThisName
    NEXT Index
ENDPROCEDURE`,
    after: callThenPrint("CALL SortNames(Names)", "Names", 7),
    cases: [
      { label: "unsorted surnames", setup: textSetup("Names", ["Olsen", "Baker", "Nguyen", "Adams", "Patel", "Clark", "Young"]) },
      { label: "reverse alphabetical", setup: textSetup("Names", ["Zimmer", "Yates", "Wong", "Vega", "Tran", "Smith", "Reid"]) },
      { label: "already in order", setup: textSetup("Names", ["Ahmed", "Brown", "Chen", "Diaz", "Evans", "Fischer", "Grant"]) },
      { label: "repeated surnames", setup: textSetup("Names", ["Khan", "Khan", "Ali", "Begum", "Khan", "Ali", "Zafar"]) },
    ],
  },

  // ------------------------------------------------- combined, harder (3)
  {
    id: "orig-sort-then-search",
    title: "RankAndFind() — sort, then binary search",
    source: "原创 · §9.2 排序与查找",
    marks: 12,
    difficulty: 3,
    chapter: "Ch09 Algorithm design",
    requirement: "PROCEDURE RankAndFind(BYREF Scores : ARRAY[1:8] OF INTEGER, BYVAL Target : INTEGER, BYREF Position : INTEGER)",
    prompt: [
      "A competition stores the eight scores of one entrant in the 1D integer array",
      "`Scores`, declared as `ARRAY[1:8] OF INTEGER`. The scores are in the order in which",
      "the attempts were made, which is not sorted, and all eight scores are different.",
      "",
      "A procedure `RankAndFind()` takes the array, one score and an integer variable.",
      "The array and the integer variable are passed by **reference**, so the calling",
      "program sees the sorted order and the result.",
      "",
      "```",
      "PROCEDURE RankAndFind(BYREF Scores : ARRAY[1:8] OF INTEGER, BYVAL Target : INTEGER, BYREF Position : INTEGER)",
      "```",
      "",
      "The procedure must:",
      "1. sort the scores into ascending order",
      "2. find the position of `Target` in the sorted array",
      "3. store that position in `Position`, or store `-1` in `Position` if `Target` is",
      "   not one of the scores.",
      "",
      "The procedure produces no output.",
      "",
      "The sorting must use a **bubble sort** and the searching must use a **binary",
      "search**. The procedure must not use the built-in sort or search routines.",
      "",
      "For example, if `Scores` holds `45, 12, 78, 23, 56, 9, 34, 67`, then after the",
      "call `RankAndFind(Scores, 34, Position)` the array holds",
      "`9, 12, 23, 34, 45, 56, 67, 78` and `Position` holds `4`.",
      "",
      "Write pseudocode for `RankAndFind()`. The calling program outputs the sorted",
      "array and then `Position`."
    ].join("\n"),
    model: `PROCEDURE RankAndFind(BYREF Scores : ARRAY[1:8] OF INTEGER, BYVAL Target : INTEGER, BYREF Position : INTEGER)
    DECLARE Pass : INTEGER
    DECLARE Index : INTEGER
    DECLARE Temp : INTEGER
    DECLARE Low : INTEGER
    DECLARE High : INTEGER
    DECLARE Mid : INTEGER
    FOR Pass <- 1 TO 7
        FOR Index <- 1 TO 8 - Pass
            IF Scores[Index] > Scores[Index + 1] THEN
                Temp <- Scores[Index]
                Scores[Index] <- Scores[Index + 1]
                Scores[Index + 1] <- Temp
            ENDIF
        NEXT Index
    NEXT Pass
    Low <- 1
    High <- 8
    Position <- -1
    WHILE Low <= High AND Position = -1
        Mid <- (Low + High) DIV 2
        IF Scores[Mid] = Target THEN
            Position <- Mid
        ELSE
            IF Scores[Mid] < Target THEN
                Low <- Mid + 1
            ELSE
                High <- Mid - 1
            ENDIF
        ENDIF
    ENDWHILE
ENDPROCEDURE`,
    after: `OUTPUT "${MARK}"
DECLARE Position : INTEGER
DECLARE PrintIndex : INTEGER
CALL RankAndFind(Scores, Target, Position)
FOR PrintIndex <- 1 TO 8
    OUTPUT Scores[PrintIndex]
NEXT PrintIndex
OUTPUT "Index: ", Position`,
    cases: [
      { label: "34 found after sorting", setup: withValue(intSetup("Scores", [45, 12, 78, 23, 56, 9, 34, 67]), "Target", 34) },
      { label: "8 found at the last position", setup: withValue(intSetup("Scores", [5, 4, 3, 2, 1, 8, 7, 6]), "Target", 8) },
      { label: "50 not present", setup: withValue(intSetup("Scores", [20, 40, 60, 80, 100, 120, 140, 160]), "Target", 50) },
      { label: "11 found at the first position", setup: withValue(intSetup("Scores", [33, 11, 22, 66, 55, 44, 88, 77]), "Target", 11) },
    ],
  },

  {
    id: "orig-frequency-no-sort",
    title: "FrequencyReport() — the most common score",
    source: "原创 · §9.2 频次统计",
    marks: 11,
    difficulty: 3,
    chapter: "Ch09 Algorithm design",
    requirement: "PROCEDURE FrequencyReport(Scores : ARRAY[1:8] OF INTEGER)",
    prompt: [
      "A survey asks eight people to rate a service from 1 to 10. The ratings are stored",
      "in the 1D integer array `Scores`, declared as `ARRAY[1:8] OF INTEGER`.",
      "",
      "A procedure `FrequencyReport()` takes the array and:",
      "- counts how often each rating from 1 to 10 occurs, using a local array of ten",
      "  counters",
      "- outputs the ten counts, one per line, for the ratings 1 to 10 in that order",
      "- outputs the rating that occurs most often, followed by its count, on one line",
      "  in the format",
      "  `Most frequent: <rating> with a count of <count>`",
      "",
      "Where two or more ratings share the highest count, the **smaller** rating is",
      "output.",
      "",
      "The array `Scores` must **not** be sorted and its contents must not be changed.",
      "",
      "For example, if `Scores` holds `3, 7, 3, 9, 3, 7, 1, 5`, the procedure outputs",
      "`1`, `0`, `3`, `0`, `1`, `0`, `2`, `0`, `1`, `0` and then",
      "`Most frequent: 3 with a count of 3`.",
      "",
      "Write pseudocode for `FrequencyReport()`."
    ].join("\n"),
    model: `PROCEDURE FrequencyReport(Scores : ARRAY[1:8] OF INTEGER)
    DECLARE Counts : ARRAY[1:10] OF INTEGER
    DECLARE Rating : INTEGER
    DECLARE Index : INTEGER
    DECLARE Best : INTEGER
    DECLARE BestCount : INTEGER
    FOR Rating <- 1 TO 10
        Counts[Rating] <- 0
    NEXT Rating
    FOR Index <- 1 TO 8
        Rating <- Scores[Index]
        Counts[Rating] <- Counts[Rating] + 1
    NEXT Index
    FOR Rating <- 1 TO 10
        OUTPUT Counts[Rating]
    NEXT Rating
    Best <- 1
    BestCount <- Counts[1]
    FOR Rating <- 2 TO 10
        IF Counts[Rating] > BestCount THEN
            Best <- Rating
            BestCount <- Counts[Rating]
        ENDIF
    NEXT Rating
    OUTPUT "Most frequent: ", Best, " with a count of ", BestCount
ENDPROCEDURE`,
    after: `OUTPUT "${MARK}"
CALL FrequencyReport(Scores)`,
    cases: [
      { label: "3 occurs three times", setup: intSetup("Scores", [3, 7, 3, 9, 3, 7, 1, 5]) },
      { label: "tie between 2, 5 and 8", setup: intSetup("Scores", [2, 2, 5, 5, 8, 8, 10, 1]) },
      { label: "all 10s", setup: intSetup("Scores", [10, 10, 10, 10, 10, 10, 10, 10]) },
      { label: "every rating once", setup: intSetup("Scores", [1, 2, 3, 4, 5, 6, 7, 8]) },
    ],
  },
];
