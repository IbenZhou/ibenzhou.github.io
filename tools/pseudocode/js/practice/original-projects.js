// Original Cambridge 9618 questions written for this bank.
// Each one is a small complete system, not a past-paper question.
// Cases supply the starting arrays (and files, where used); `after` calls the
// requested module and prints the result so that runs can be compared.

const MARK = "===RESULT===";

function literal(value, type) {
  if (type === "STRING") return `"${value}"`;
  if (type === "CHAR") return `'${value}'`;
  if (type === "REAL") {
    const text = String(value);
    return text.includes(".") ? text : `${text}.0`;
  }
  return String(value);
}

function listSetup(name, type, values) {
  let code = `DECLARE ${name} : ARRAY[1:${values.length}] OF ${type}\n`;
  values.forEach((value, index) => {
    code += `${name}[${index + 1}] <- ${literal(value, type)}\n`;
  });
  return code;
}

function gridSetup(name, type, rows) {
  let code = `DECLARE ${name} : ARRAY[1:${rows.length}, 1:${rows[0].length}] OF ${type}\n`;
  rows.forEach((row, r) => {
    row.forEach((value, c) => {
      code += `${name}[${r + 1}, ${c + 1}] <- ${literal(value, type)}\n`;
    });
  });
  return code;
}

function printGrid(name, rows, columns) {
  const cells = [];
  for (let c = 1; c <= columns; c += 1) cells.push(`${name}[PrintRow, ${c}]`);
  return `DECLARE PrintRow : INTEGER
FOR PrintRow <- 1 TO ${rows}
    OUTPUT ${cells.join(', " ", ')}
NEXT PrintRow`;
}

const TEAMS = ["Rovers", "City", "United", "Athletic", "Wanderers", "Town"];

function leagueSetup(teams, pairs) {
  const grid = Array.from({ length: 6 }, () => Array(6).fill("-"));
  for (const [a, b, result] of pairs) {
    const opposite = result === "W" ? "L" : result === "L" ? "W" : "D";
    grid[a - 1][b - 1] = result;
    grid[b - 1][a - 1] = opposite;
  }
  return listSetup("Teams", "STRING", teams) + gridSetup("Results", "CHAR", grid);
}

export const PROJECTS = [
  {
    id: "orig-proj-01",
    title: "Cinema booking on a 2D grid",
    source: "原创 · 综合 · 2D 数组 + 座位预订",
    marks: 12,
    difficulty: 3,
    chapter: "Ch10 Data types and structures",
    requirement: "PROCEDURE BookSeats(BYREF Seats : ARRAY[1:4, 1:5] OF STRING, BYVAL Row : INTEGER, BYVAL Count : INTEGER)",
    prompt: [
      "A small cinema has 4 rows with 5 seats in each row. The 2D string array `Seats`",
      "uses `.` for a free seat and `X` for a booked seat.",
      "",
      "A procedure `BookSeats()` will book seats in one row.",
      "",
      "```",
      "PROCEDURE BookSeats(BYREF Seats : ARRAY[1:4, 1:5] OF STRING, BYVAL Row : INTEGER, BYVAL Count : INTEGER)",
      "```",
      "",
      "The procedure must:",
      "- reject the request if `Row` is not 1 to 4 or `Count` is not 1 to 5, output `Booking rejected` and leave the grid unchanged",
      "- otherwise book up to `Count` free seats in that row, working from column 1 to column 5",
      "- change each booked seat to `X`; if the row has fewer than `Count` free seats, book all of them",
      "- count every `X` in the whole grid and calculate the occupancy using `Occupied * 100 DIV 20`",
      "",
      "For a valid request, output exactly:",
      "",
      "```",
      "Booked <n> seat(s) in row <row>",
      "Occupancy <p>%",
      "```",
      "",
      "为便于自动判分,有效请求只输出上面两行;无效请求只输出 `Booking rejected`。"
    ].join("\n"),
    model: `PROCEDURE BookSeats(BYREF Seats : ARRAY[1:4, 1:5] OF STRING, BYVAL Row : INTEGER, BYVAL Count : INTEGER)
    DECLARE Column : INTEGER
    DECLARE Booked : INTEGER
    DECLARE Occupied : INTEGER
    DECLARE R : INTEGER
    IF Row < 1 OR Row > 4 OR Count < 1 OR Count > 5 THEN
        OUTPUT "Booking rejected"
    ELSE
        Booked <- 0
        Column <- 1
        WHILE Column <= 5 AND Booked < Count
            IF Seats[Row, Column] = "." THEN
                Seats[Row, Column] <- "X"
                Booked <- Booked + 1
            ENDIF
            Column <- Column + 1
        ENDWHILE
        Occupied <- 0
        FOR R <- 1 TO 4
            FOR Column <- 1 TO 5
                IF Seats[R, Column] = "X" THEN
                    Occupied <- Occupied + 1
                ENDIF
            NEXT Column
        NEXT R
        OUTPUT "Booked ", Booked, " seat(s) in row ", Row
        OUTPUT "Occupancy ", Occupied * 100 DIV 20, "%"
    ENDIF
ENDPROCEDURE`,
    cases: [
      {
        label: "row 3 has three free seats",
        setup: gridSetup("Seats", "STRING", [
          ["X", ".", "X", ".", "X"],
          [".", "X", ".", "X", "."],
          ["X", ".", ".", "X", "."],
          [".", "X", "X", ".", "X"],
        ]),
        after: `OUTPUT "${MARK}"
CALL BookSeats(Seats, 3, 2)
${printGrid("Seats", 4, 5)}`,
      },
      {
        label: "row 2 has only one free seat",
        setup: gridSetup("Seats", "STRING", [
          [".", ".", "X", ".", "."],
          ["X", "X", ".", "X", "X"],
          [".", "X", ".", "X", "."],
          ["X", ".", "X", ".", "X"],
        ]),
        after: `OUTPUT "${MARK}"
CALL BookSeats(Seats, 2, 3)
${printGrid("Seats", 4, 5)}`,
      },
      {
        label: "row 5 does not exist",
        setup: gridSetup("Seats", "STRING", [
          ["X", ".", "X", ".", "X"],
          [".", "X", ".", "X", "."],
          ["X", ".", ".", "X", "."],
          [".", "X", "X", ".", "X"],
        ]),
        after: `OUTPUT "${MARK}"
CALL BookSeats(Seats, 5, 2)
${printGrid("Seats", 4, 5)}`,
      },
    ],
  },

  {
    id: "orig-proj-02",
    title: "Inventory restock report",
    source: "原创 · 综合 · 数组 + 库存补货",
    marks: 11,
    difficulty: 3,
    chapter: "Ch10 Data types and structures",
    requirement: "PROCEDURE Restock(BYREF Stock : ARRAY[1:6] OF INTEGER, BYVAL Price : ARRAY[1:6] OF REAL, BYVAL Threshold : INTEGER)",
    prompt: [
      "A shop stores the quantity of each of six products in `Stock` and the unit price of",
      "each product in `Price`.",
      "",
      "A procedure `Restock()` will top up every product whose stock is below a threshold.",
      "",
      "```",
      "PROCEDURE Restock(BYREF Stock : ARRAY[1:6] OF INTEGER, BYVAL Price : ARRAY[1:6] OF REAL, BYVAL Threshold : INTEGER)",
      "```",
      "",
      "The procedure must:",
      "- output `Invalid threshold` and change nothing if `Threshold` is less than 1",
      "- otherwise, for every product with `Stock[I] < Threshold`, add exactly enough units to reach `Threshold`",
      "- count how many products were restocked, and total the cost of the added units",
      "- after restocking, total the value of all stock using the new quantities and the prices",
      "- round both money values to 2 decimal places using `ROUND(value, 2)`",
      "",
      "Output exactly:",
      "",
      "```",
      "Restocked <n> item(s)",
      "Restock cost = <cost>",
      "Stock value = <value>",
      "```",
      "",
      "为便于自动判分,输出只使用上面三行;阈值无效时只输出 `Invalid threshold`。"
    ].join("\n"),
    model: `PROCEDURE Restock(BYREF Stock : ARRAY[1:6] OF INTEGER, BYVAL Price : ARRAY[1:6] OF REAL, BYVAL Threshold : INTEGER)
    DECLARE I : INTEGER
    DECLARE Need : INTEGER
    DECLARE Items : INTEGER
    DECLARE Cost : REAL
    DECLARE Value : REAL
    IF Threshold < 1 THEN
        OUTPUT "Invalid threshold"
    ELSE
        Items <- 0
        Cost <- 0
        FOR I <- 1 TO 6
            IF Stock[I] < Threshold THEN
                Need <- Threshold - Stock[I]
                Stock[I] <- Threshold
                Cost <- Cost + Need * Price[I]
                Items <- Items + 1
            ENDIF
        NEXT I
        Value <- 0
        FOR I <- 1 TO 6
            Value <- Value + Stock[I] * Price[I]
        NEXT I
        OUTPUT "Restocked ", Items, " item(s)"
        OUTPUT "Restock cost = ", ROUND(Cost, 2)
        OUTPUT "Stock value = ", ROUND(Value, 2)
    ENDIF
ENDPROCEDURE`,
    cases: [
      {
        label: "four products below 10",
        setup: listSetup("Stock", "INTEGER", [4, 12, 2, 9, 0, 15])
          + listSetup("Price", "REAL", [2.5, 1.25, 4.0, 3.5, 1.5, 2.0]),
        after: `OUTPUT "${MARK}"
CALL Restock(Stock, Price, 10)`,
      },
      {
        label: "three products below 6",
        setup: listSetup("Stock", "INTEGER", [5, 6, 7, 2, 9, 1])
          + listSetup("Price", "REAL", [1.5, 2.0, 0.5, 4.0, 2.5, 3.0]),
        after: `OUTPUT "${MARK}"
CALL Restock(Stock, Price, 6)`,
      },
      {
        label: "threshold 0 is invalid",
        setup: listSetup("Stock", "INTEGER", [12, 15, 8, 20, 11, 9])
          + listSetup("Price", "REAL", [2.5, 1.0, 4.0, 0.5, 3.0, 2.0]),
        after: `OUTPUT "${MARK}"
CALL Restock(Stock, Price, 0)`,
      },
    ],
  },

  {
    id: "orig-proj-03",
    title: "Exam results and grade bands",
    source: "原创 · 综合 · CASE 分级 + 成绩统计",
    marks: 11,
    difficulty: 3,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION Grade(Mark : INTEGER) RETURNS STRING; PROCEDURE Results(BYVAL Names : ARRAY[1:6] OF STRING, BYVAL Marks : ARRAY[1:6] OF INTEGER)",
    prompt: [
      "Six students sit an examination. Their names are stored in `Names` and their marks",
      "in `Marks`; every mark is from 0 to 100 inclusive.",
      "",
      "A function `Grade()` returns the grade for one mark, and a procedure `Results()`",
      "reports the whole group.",
      "",
      "```",
      "FUNCTION Grade(Mark : INTEGER) RETURNS STRING",
      "PROCEDURE Results(BYVAL Names : ARRAY[1:6] OF STRING, BYVAL Marks : ARRAY[1:6] OF INTEGER)",
      "```",
      "",
      "`Grade()` must use `CASE OF` with these range labels:",
      "- 80 to 100: `A*`",
      "- 70 to 79: `A`",
      "- 60 to 69: `B`",
      "- 50 to 59: `C`",
      "- 40 to 49: `D`",
      "- 30 to 39: `E`",
      "- 0 to 29: `U`",
      "",
      "`Results()` must output one line per student in array order, then the mean mark",
      "rounded to 1 decimal place, then the number of passes (a mark of 40 or more).",
      "",
      "Output exactly:",
      "",
      "```",
      "<name>: <mark> <grade>",
      "...one line for each of the six students...",
      "Average = <mean>",
      "Passes = <count>",
      "```",
      "",
      "为便于自动判分,六行成绩之后固定输出 `Average = <平均分>` 和 `Passes = <及格人数>`,平均分用 `ROUND(..., 1)`。"
    ].join("\n"),
    model: `FUNCTION Grade(Mark : INTEGER) RETURNS STRING
    DECLARE G : STRING
    CASE OF Mark
        80 TO 100 : G <- "A*"
        70 TO 79 : G <- "A"
        60 TO 69 : G <- "B"
        50 TO 59 : G <- "C"
        40 TO 49 : G <- "D"
        30 TO 39 : G <- "E"
        0 TO 29 : G <- "U"
        OTHERWISE : G <- "?"
    ENDCASE
    RETURN G
ENDFUNCTION

PROCEDURE Results(BYVAL Names : ARRAY[1:6] OF STRING, BYVAL Marks : ARRAY[1:6] OF INTEGER)
    DECLARE I : INTEGER
    DECLARE Total : INTEGER
    DECLARE Passes : INTEGER
    DECLARE Average : REAL
    Total <- 0
    Passes <- 0
    FOR I <- 1 TO 6
        OUTPUT Names[I], ": ", Marks[I], " ", Grade(Marks[I])
        Total <- Total + Marks[I]
        IF Marks[I] >= 40 THEN
            Passes <- Passes + 1
        ENDIF
    NEXT I
    Average <- Total / 6
    OUTPUT "Average = ", ROUND(Average, 1)
    OUTPUT "Passes = ", Passes
ENDPROCEDURE`,
    cases: [
      {
        label: "mixed marks with one fail",
        setup: listSetup("Names", "STRING", ["Amir", "Bea", "Chen", "Dev", "Ella", "Finn"])
          + listSetup("Marks", "INTEGER", [85, 72, 64, 55, 41, 28]),
        after: `OUTPUT "${MARK}"
CALL Results(Names, Marks)`,
      },
      {
        label: "six passes",
        setup: listSetup("Names", "STRING", ["Amir", "Bea", "Chen", "Dev", "Ella", "Finn"])
          + listSetup("Marks", "INTEGER", [90, 80, 70, 60, 50, 40]),
        after: `OUTPUT "${MARK}"
CALL Results(Names, Marks)`,
      },
      {
        label: "low marks and one distinction",
        setup: listSetup("Names", "STRING", ["Amir", "Bea", "Chen", "Dev", "Ella", "Finn"])
          + listSetup("Marks", "INTEGER", [39, 29, 18, 7, 0, 100]),
        after: `OUTPUT "${MARK}"
CALL Results(Names, Marks)`,
      },
    ],
  },

  {
    id: "orig-proj-04",
    title: "Bank account transactions",
    source: "原创 · 综合 · BYREF + 账户交易",
    marks: 11,
    difficulty: 3,
    chapter: "Ch11 Programming",
    requirement: "PROCEDURE Apply(BYREF Balance : REAL, BYVAL Amounts : ARRAY[1:5] OF REAL, BYVAL Kinds : ARRAY[1:5] OF STRING)",
    prompt: [
      "A bank account has a balance stored in `Balance`. Five transactions are held in two",
      "arrays: `Amounts` holds the amount of each transaction and `Kinds` holds `D` for a",
      "deposit or `W` for a withdrawal.",
      "",
      "A procedure `Apply()` processes the transactions in order and changes the balance.",
      "",
      "```",
      "PROCEDURE Apply(BYREF Balance : REAL, BYVAL Amounts : ARRAY[1:5] OF REAL, BYVAL Kinds : ARRAY[1:5] OF STRING)",
      "```",
      "",
      "For each transaction, in array order:",
      "- reject it if the amount is 0 or less, or if the kind is not `D` or `W`, or if it is a withdrawal larger than the current balance",
      "- a rejected transaction must not change the balance",
      "- otherwise apply it and accept it",
      "",
      "Output one line per transaction, then the final balance:",
      "",
      "```",
      "Transaction <i> accepted",
      "Transaction <i> rejected",
      "Balance = <balance>",
      "```",
      "",
      "为便于自动判分,每笔交易按顺序输出 `Transaction <序号> accepted` 或 `Transaction <序号> rejected`,最后输出 `Balance = <余额>`。"
    ].join("\n"),
    model: `PROCEDURE Apply(BYREF Balance : REAL, BYVAL Amounts : ARRAY[1:5] OF REAL, BYVAL Kinds : ARRAY[1:5] OF STRING)
    DECLARE I : INTEGER
    DECLARE Valid : BOOLEAN
    FOR I <- 1 TO 5
        Valid <- TRUE
        IF Amounts[I] <= 0 THEN
            Valid <- FALSE
        ENDIF
        IF Kinds[I] <> "D" AND Kinds[I] <> "W" THEN
            Valid <- FALSE
        ENDIF
        IF Valid = TRUE AND Kinds[I] = "W" AND Amounts[I] > Balance THEN
            Valid <- FALSE
        ENDIF
        IF Valid = TRUE THEN
            IF Kinds[I] = "D" THEN
                Balance <- Balance + Amounts[I]
            ELSE
                Balance <- Balance - Amounts[I]
            ENDIF
            OUTPUT "Transaction ", I, " accepted"
        ELSE
            OUTPUT "Transaction ", I, " rejected"
        ENDIF
    NEXT I
    OUTPUT "Balance = ", Balance
ENDPROCEDURE`,
    cases: [
      {
        label: "deposit, deposit, zero, withdrawal, overdraw",
        setup: `DECLARE Balance : REAL
Balance <- 500.0
${listSetup("Amounts", "REAL", [250.5, 100.25, 0, 75.5, 900.0])}${listSetup("Kinds", "STRING", ["D", "D", "W", "W", "W"])}`,
        after: `OUTPUT "${MARK}"
CALL Apply(Balance, Amounts, Kinds)`,
      },
      {
        label: "withdrawals with one overdraw",
        setup: `DECLARE Balance : REAL
Balance <- 100.0
${listSetup("Amounts", "REAL", [50.0, 25.0, 200.0, 10.0, 5.0])}${listSetup("Kinds", "STRING", ["W", "W", "W", "D", "D"])}`,
        after: `OUTPUT "${MARK}"
CALL Apply(Balance, Amounts, Kinds)`,
      },
      {
        label: "invalid kind and negative amount",
        setup: `DECLARE Balance : REAL
Balance <- 1000.0
${listSetup("Amounts", "REAL", [100.0, -20.0, 300.0, 50.5, 700.0])}${listSetup("Kinds", "STRING", ["D", "X", "W", "D", "W"])}`,
        after: `OUTPUT "${MARK}"
CALL Apply(Balance, Amounts, Kinds)`,
      },
    ],
  },

  {
    id: "orig-proj-05",
    title: "Word frequency in a sentence",
    source: "原创 · 综合 · 字符串 + 词频统计",
    marks: 12,
    difficulty: 3,
    chapter: "Ch09 Algorithm design",
    requirement: "PROCEDURE WordFrequency(BYVAL Sentence : STRING)",
    prompt: [
      "A procedure `WordFrequency()` analyses one sentence and reports how often each",
      "different word occurs.",
      "",
      "```",
      "PROCEDURE WordFrequency(BYVAL Sentence : STRING)",
      "```",
      "",
      "The sentence contains words separated by single spaces. Each word contains letters",
      "only, there are no leading or trailing spaces, and there are at most 20 words.",
      "Upper-case and lower-case letters are treated as the same letter; every word that",
      "is output must be in upper case.",
      "",
      "The procedure must:",
      "- split the sentence into words using string handling",
      "- use local arrays `Words[1:20]` and `Counts[1:20]` to store each different word and its count",
      "- output each different word in the order in which it first appears, with its count",
      "- then output the most common word; if two words have the same count, the one that appears first wins",
      "",
      "Output exactly:",
      "",
      "```",
      "<WORD> <count>",
      "...one line for each different word...",
      "Most common: <WORD> <count>",
      "```",
      "",
      "为便于自动判分,每个不同单词按首次出现顺序输出一行 `<单词> <次数>`,最后一行固定为 `Most common: <单词> <次数>`;单词全部转为大写。"
    ].join("\n"),
    model: `PROCEDURE WordFrequency(BYVAL Sentence : STRING)
    DECLARE Words : ARRAY[1:20] OF STRING
    DECLARE Counts : ARRAY[1:20] OF INTEGER
    DECLARE AllText : STRING
    DECLARE ThisWord : STRING
    DECLARE Letter : STRING
    DECLARE NumWords : INTEGER
    DECLARE Best : INTEGER
    DECLARE Index : INTEGER
    DECLARE Position : INTEGER
    DECLARE Found : BOOLEAN
    AllText <- Sentence & " "
    NumWords <- 0
    ThisWord <- ""
    FOR Index <- 1 TO LENGTH(AllText)
        Letter <- MID(AllText, Index, 1)
        IF Letter = " " THEN
            IF ThisWord <> "" THEN
                Found <- FALSE
                FOR Position <- 1 TO NumWords
                    IF Words[Position] = ThisWord THEN
                        Counts[Position] <- Counts[Position] + 1
                        Found <- TRUE
                    ENDIF
                NEXT Position
                IF Found = FALSE THEN
                    NumWords <- NumWords + 1
                    Words[NumWords] <- ThisWord
                    Counts[NumWords] <- 1
                ENDIF
                ThisWord <- ""
            ENDIF
        ELSE
            ThisWord <- ThisWord & TO_UPPER(Letter)
        ENDIF
    NEXT Index
    FOR Position <- 1 TO NumWords
        OUTPUT Words[Position], " ", Counts[Position]
    NEXT Position
    Best <- 1
    FOR Position <- 2 TO NumWords
        IF Counts[Position] > Counts[Best] THEN
            Best <- Position
        ENDIF
    NEXT Position
    OUTPUT "Most common: ", Words[Best], " ", Counts[Best]
ENDPROCEDURE`,
    cases: [
      {
        label: "the cat and the dog and the bird",
        after: `OUTPUT "${MARK}"
CALL WordFrequency("the cat and the dog and the bird")`,
      },
      {
        label: "one two one TWO three",
        after: `OUTPUT "${MARK}"
CALL WordFrequency("One two one TWO three")`,
      },
      {
        label: "a a a b b c",
        after: `OUTPUT "${MARK}"
CALL WordFrequency("a a a b b c")`,
      },
    ],
  },

  {
    id: "orig-proj-06",
    title: "Queue with front and rear pointers",
    source: "原创 · 综合 · 数组队列 + 指针",
    marks: 12,
    difficulty: 3,
    chapter: "Ch10 Data types and structures",
    requirement: "PROCEDURE Enqueue(BYREF Queue : ARRAY[1:8] OF STRING, BYREF Front : INTEGER, BYREF Rear : INTEGER, BYVAL Item : STRING); PROCEDURE Dequeue(BYREF Queue : ARRAY[1:8] OF STRING, BYREF Front : INTEGER, BYREF Rear : INTEGER, BYREF Item : STRING)",
    prompt: [
      "A queue of strings is stored in `Queue[1:8]`. `Front` holds the index of the first",
      "item and `Rear` holds the index of the last item. `Front = 0` and `Rear = 0`",
      "means the queue is empty. The queue is circular: index 8 is followed by index 1,",
      "and it can hold all eight items.",
      "",
      "A procedure `Enqueue()` adds one item and a procedure `Dequeue()` removes one item.",
      "",
      "```",
      "PROCEDURE Enqueue(BYREF Queue : ARRAY[1:8] OF STRING, BYREF Front : INTEGER, BYREF Rear : INTEGER, BYVAL Item : STRING)",
      "PROCEDURE Dequeue(BYREF Queue : ARRAY[1:8] OF STRING, BYREF Front : INTEGER, BYREF Rear : INTEGER, BYREF Item : STRING)",
      "```",
      "",
      "`Enqueue()` must:",
      "- output `Queue full` and change nothing if the queue is full",
      "- otherwise place `Item` in the next free position",
      "",
      "`Dequeue()` must:",
      "- set `Item` to `EMPTY` and change nothing if the queue is empty",
      "- otherwise copy the first item into `Item`, advance `Front`, and set both pointers to 0 when the last item is removed",
      "",
      "为便于自动判分,入队满时输出 `Queue full`;出队空时把 `Item` 设为 `EMPTY`;两个过程在其他情况下不输出。"
    ].join("\n"),
    model: `PROCEDURE Enqueue(BYREF Queue : ARRAY[1:8] OF STRING, BYREF Front : INTEGER, BYREF Rear : INTEGER, BYVAL Item : STRING)
    DECLARE NextPos : INTEGER
    IF Front = 0 THEN
        Front <- 1
        Rear <- 1
        Queue[1] <- Item
    ELSE
        NextPos <- Rear MOD 8 + 1
        IF NextPos = Front THEN
            OUTPUT "Queue full"
        ELSE
            Rear <- NextPos
            Queue[Rear] <- Item
        ENDIF
    ENDIF
ENDPROCEDURE

PROCEDURE Dequeue(BYREF Queue : ARRAY[1:8] OF STRING, BYREF Front : INTEGER, BYREF Rear : INTEGER, BYREF Item : STRING)
    IF Front = 0 THEN
        Item <- "EMPTY"
    ELSE
        Item <- Queue[Front]
        IF Front = Rear THEN
            Front <- 0
            Rear <- 0
        ELSE
            Front <- Front MOD 8 + 1
        ENDIF
    ENDIF
ENDPROCEDURE`,
    cases: [
      {
        label: "empty queue: add two, remove three, add one",
        setup: `DECLARE Front : INTEGER
DECLARE Rear : INTEGER
${listSetup("Queue", "STRING", ["", "", "", "", "", "", "", ""])}Front <- 0
Rear <- 0`,
        after: `DECLARE Item : STRING
OUTPUT "${MARK}"
CALL Enqueue(Queue, Front, Rear, "A")
CALL Enqueue(Queue, Front, Rear, "B")
CALL Dequeue(Queue, Front, Rear, Item)
OUTPUT Item
CALL Dequeue(Queue, Front, Rear, Item)
OUTPUT Item
CALL Dequeue(Queue, Front, Rear, Item)
OUTPUT Item
CALL Enqueue(Queue, Front, Rear, "C")
CALL Dequeue(Queue, Front, Rear, Item)
OUTPUT Item`,
      },
      {
        label: "queue wraps from 7 to 8 then 1",
        setup: `DECLARE Front : INTEGER
DECLARE Rear : INTEGER
${listSetup("Queue", "STRING", ["", "", "", "", "X", "Y", "Z", ""])}Front <- 5
Rear <- 7`,
        after: `DECLARE Item : STRING
OUTPUT "${MARK}"
CALL Enqueue(Queue, Front, Rear, "W")
CALL Enqueue(Queue, Front, Rear, "V")
CALL Dequeue(Queue, Front, Rear, Item)
OUTPUT Item
CALL Dequeue(Queue, Front, Rear, Item)
OUTPUT Item
CALL Dequeue(Queue, Front, Rear, Item)
OUTPUT Item
CALL Dequeue(Queue, Front, Rear, Item)
OUTPUT Item
CALL Dequeue(Queue, Front, Rear, Item)
OUTPUT Item
CALL Dequeue(Queue, Front, Rear, Item)
OUTPUT Item`,
      },
      {
        label: "full queue rejects another item",
        setup: `DECLARE Front : INTEGER
DECLARE Rear : INTEGER
${listSetup("Queue", "STRING", ["A", "B", "C", "D", "E", "F", "G", "H"])}Front <- 3
Rear <- 2`,
        after: `DECLARE Item : STRING
OUTPUT "${MARK}"
CALL Enqueue(Queue, Front, Rear, "I")
CALL Dequeue(Queue, Front, Rear, Item)
OUTPUT Item
CALL Dequeue(Queue, Front, Rear, Item)
OUTPUT Item
CALL Dequeue(Queue, Front, Rear, Item)
OUTPUT Item
CALL Dequeue(Queue, Front, Rear, Item)
OUTPUT Item`,
      },
    ],
  },

  {
    id: "orig-proj-07",
    title: "Stack with push and pop",
    source: "原创 · 综合 · 数组栈 + 下溢检查",
    marks: 11,
    difficulty: 3,
    chapter: "Ch10 Data types and structures",
    requirement: "PROCEDURE Push(BYREF Stack : ARRAY[1:6] OF INTEGER, BYREF Top : INTEGER, BYVAL Value : INTEGER); PROCEDURE Pop(BYREF Stack : ARRAY[1:6] OF INTEGER, BYREF Top : INTEGER, BYREF Value : INTEGER)",
    prompt: [
      "A stack of integers is stored in `Stack[1:6]`. `Top` holds the index of the top",
      "item; `Top = 0` means the stack is empty.",
      "",
      "A procedure `Push()` adds one value and a procedure `Pop()` removes one value.",
      "",
      "```",
      "PROCEDURE Push(BYREF Stack : ARRAY[1:6] OF INTEGER, BYREF Top : INTEGER, BYVAL Value : INTEGER)",
      "PROCEDURE Pop(BYREF Stack : ARRAY[1:6] OF INTEGER, BYREF Top : INTEGER, BYREF Value : INTEGER)",
      "```",
      "",
      "`Push()` must:",
      "- check the value first: if it is less than 1 or greater than 99, output `Invalid value` and change nothing",
      "- otherwise, if the stack is full, output `Stack full` and change nothing",
      "- otherwise add the value on top of the stack",
      "",
      "`Pop()` must:",
      "- output `Underflow` and set `Value` to -1 if the stack is empty",
      "- otherwise copy the top value into `Value` and remove it from the stack",
      "",
      "为便于自动判分,`Push` 只在拒绝时输出 `Invalid value` 或 `Stack full`;`Pop` 下溢时输出 `Underflow` 并把 `Value` 设为 -1。"
    ].join("\n"),
    model: `PROCEDURE Push(BYREF Stack : ARRAY[1:6] OF INTEGER, BYREF Top : INTEGER, BYVAL Value : INTEGER)
    IF Value < 1 OR Value > 99 THEN
        OUTPUT "Invalid value"
    ELSE
        IF Top = 6 THEN
            OUTPUT "Stack full"
        ELSE
            Top <- Top + 1
            Stack[Top] <- Value
        ENDIF
    ENDIF
ENDPROCEDURE

PROCEDURE Pop(BYREF Stack : ARRAY[1:6] OF INTEGER, BYREF Top : INTEGER, BYREF Value : INTEGER)
    IF Top = 0 THEN
        OUTPUT "Underflow"
        Value <- -1
    ELSE
        Value <- Stack[Top]
        Top <- Top - 1
    ENDIF
ENDPROCEDURE`,
    cases: [
      {
        label: "push four values including an invalid one",
        setup: `DECLARE Top : INTEGER
${listSetup("Stack", "INTEGER", [0, 0, 0, 0, 0, 0])}Top <- 0`,
        after: `DECLARE Value : INTEGER
OUTPUT "${MARK}"
CALL Push(Stack, Top, 12)
CALL Push(Stack, Top, 34)
CALL Push(Stack, Top, 0)
CALL Push(Stack, Top, 56)
CALL Pop(Stack, Top, Value)
OUTPUT Value
CALL Pop(Stack, Top, Value)
OUTPUT Value
CALL Pop(Stack, Top, Value)
OUTPUT Value
CALL Pop(Stack, Top, Value)
OUTPUT Value`,
      },
      {
        label: "full stack rejects a value, then empties",
        setup: `DECLARE Top : INTEGER
${listSetup("Stack", "INTEGER", [10, 20, 30, 40, 50, 60])}Top <- 6`,
        after: `DECLARE Value : INTEGER
OUTPUT "${MARK}"
CALL Push(Stack, Top, 70)
CALL Push(Stack, Top, 100)
CALL Pop(Stack, Top, Value)
OUTPUT Value
CALL Pop(Stack, Top, Value)
OUTPUT Value
CALL Pop(Stack, Top, Value)
OUTPUT Value
CALL Pop(Stack, Top, Value)
OUTPUT Value
CALL Pop(Stack, Top, Value)
OUTPUT Value
CALL Pop(Stack, Top, Value)
OUTPUT Value
CALL Pop(Stack, Top, Value)
OUTPUT Value`,
      },
      {
        label: "two values then two pops and an underflow",
        setup: `DECLARE Top : INTEGER
${listSetup("Stack", "INTEGER", [0, 0, 0, 0, 0, 0])}Top <- 0`,
        after: `DECLARE Value : INTEGER
OUTPUT "${MARK}"
CALL Push(Stack, Top, 7)
CALL Push(Stack, Top, 99)
CALL Pop(Stack, Top, Value)
OUTPUT Value
CALL Pop(Stack, Top, Value)
OUTPUT Value
CALL Pop(Stack, Top, Value)
OUTPUT Value`,
      },
    ],
  },

  {
    id: "orig-proj-08",
    title: "Library overdue fines",
    source: "原创 · 综合 · 逾期罚款 + MOD",
    marks: 11,
    difficulty: 3,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION Fine(DaysLate : INTEGER) RETURNS INTEGER; PROCEDURE LoanReport(BYVAL Titles : ARRAY[1:5] OF STRING, BYVAL Days : ARRAY[1:5] OF INTEGER)",
    prompt: [
      "A library charges overdue fines in pence. Five borrowed titles are stored in",
      "`Titles`, and the number of days each is overdue is stored in `Days`.",
      "",
      "A function `Fine()` calculates one fine, and a procedure `LoanReport()` reports",
      "all five loans.",
      "",
      "```",
      "FUNCTION Fine(DaysLate : INTEGER) RETURNS INTEGER",
      "PROCEDURE LoanReport(BYVAL Titles : ARRAY[1:5] OF STRING, BYVAL Days : ARRAY[1:5] OF INTEGER)",
      "```",
      "",
      "`Fine()` must return:",
      "- 0 if `DaysLate` is 0 or less",
      "- otherwise 50p for each complete week overdue, plus 20p for each remaining day",
      "",
      "For example, 10 days gives 110p and 8 days gives 70p. Use `DIV` and `MOD`.",
      "",
      "`LoanReport()` must output each title with its fine, then the total fine and the",
      "largest single fine.",
      "",
      "Output exactly:",
      "",
      "```",
      "<title>: <fine>p",
      "...one line for each of the five titles...",
      "Total = <total>p",
      "Highest = <highest>p",
      "```",
      "",
      "为便于自动判分,五本书按数组顺序各输出一行 `<书名>: <罚款>p`,最后两行固定为 `Total = <总额>p` 和 `Highest = <最高额>p`。"
    ].join("\n"),
    model: `FUNCTION Fine(DaysLate : INTEGER) RETURNS INTEGER
    DECLARE Amount : INTEGER
    IF DaysLate <= 0 THEN
        Amount <- 0
    ELSE
        Amount <- (DaysLate DIV 7) * 50 + (DaysLate MOD 7) * 20
    ENDIF
    RETURN Amount
ENDFUNCTION

PROCEDURE LoanReport(BYVAL Titles : ARRAY[1:5] OF STRING, BYVAL Days : ARRAY[1:5] OF INTEGER)
    DECLARE I : INTEGER
    DECLARE ThisFine : INTEGER
    DECLARE Total : INTEGER
    DECLARE Highest : INTEGER
    Total <- 0
    Highest <- 0
    FOR I <- 1 TO 5
        ThisFine <- Fine(Days[I])
        OUTPUT Titles[I], ": ", ThisFine, "p"
        Total <- Total + ThisFine
        IF ThisFine > Highest THEN
            Highest <- ThisFine
        ENDIF
    NEXT I
    OUTPUT "Total = ", Total, "p"
    OUTPUT "Highest = ", Highest, "p"
ENDPROCEDURE`,
    cases: [
      {
        label: "0, 3, 7, 10 and 16 days",
        setup: listSetup("Titles", "STRING", ["Clean Code", "Dune", "Emma", "Ulysses", "Beloved"])
          + listSetup("Days", "INTEGER", [0, 3, 7, 10, 16]),
        after: `OUTPUT "${MARK}"
CALL LoanReport(Titles, Days)`,
      },
      {
        label: "1, 6, 8, 14 and 21 days",
        setup: listSetup("Titles", "STRING", ["Clean Code", "Dune", "Emma", "Ulysses", "Beloved"])
          + listSetup("Days", "INTEGER", [1, 6, 8, 14, 21]),
        after: `OUTPUT "${MARK}"
CALL LoanReport(Titles, Days)`,
      },
      {
        label: "2, 5, 9, 13 and 30 days",
        setup: listSetup("Titles", "STRING", ["Clean Code", "Dune", "Emma", "Ulysses", "Beloved"])
          + listSetup("Days", "INTEGER", [2, 5, 9, 13, 30]),
        after: `OUTPUT "${MARK}"
CALL LoanReport(Titles, Days)`,
      },
    ],
  },

  {
    id: "orig-proj-09",
    title: "Regional sales report file",
    source: "原创 · 综合 · 2D 数组 + 文件报表",
    marks: 12,
    difficulty: 3,
    chapter: "Ch11 Programming",
    requirement: "PROCEDURE SalesReport(BYVAL Regions : ARRAY[1:4] OF STRING, BYVAL Sales : ARRAY[1:4, 1:3] OF INTEGER, BYVAL FileName : STRING)",
    prompt: [
      "A company records the sales of four regions. `Regions` holds the region names and",
      "`Sales` holds three monthly sales figures for each region, one row per region.",
      "",
      "A procedure `SalesReport()` creates a text file containing a summary.",
      "",
      "```",
      "PROCEDURE SalesReport(BYVAL Regions : ARRAY[1:4] OF STRING, BYVAL Sales : ARRAY[1:4, 1:3] OF INTEGER, BYVAL FileName : STRING)",
      "```",
      "",
      "The procedure must:",
      "- total the three sales figures for each region",
      "- write one line for each region in array order",
      "- track the grand total and the region with the largest total; if two regions tie, the one earlier in `Regions` wins",
      "- write a grand-total line and a best-region line",
      "- create or overwrite `FileName`, and close it after writing",
      "",
      "The file must contain exactly these six lines:",
      "",
      "```",
      "<region>,<total>",
      "...one line for each of the four regions...",
      "TOTAL,<grand total>",
      "BEST,<region>",
      "```",
      "",
      "`SalesReport()` must not output anything to the screen.",
      "",
      "为便于自动判分,文件前四行格式为 `地区,该地区总额`,最后两行固定为 `TOTAL,<总额>` 和 `BEST,<总额最大的地区>`。"
    ].join("\n"),
    model: `PROCEDURE SalesReport(BYVAL Regions : ARRAY[1:4] OF STRING, BYVAL Sales : ARRAY[1:4, 1:3] OF INTEGER, BYVAL FileName : STRING)
    DECLARE Row : INTEGER
    DECLARE Column : INTEGER
    DECLARE Total : INTEGER
    DECLARE Grand : INTEGER
    DECLARE BestRow : INTEGER
    DECLARE BestTotal : INTEGER
    Grand <- 0
    BestRow <- 1
    BestTotal <- -1
    OPENFILE FileName FOR WRITE
    FOR Row <- 1 TO 4
        Total <- 0
        FOR Column <- 1 TO 3
            Total <- Total + Sales[Row, Column]
        NEXT Column
        WRITEFILE FileName, Regions[Row] & "," & NUM_TO_STR(Total)
        Grand <- Grand + Total
        IF Total > BestTotal THEN
            BestTotal <- Total
            BestRow <- Row
        ENDIF
    NEXT Row
    WRITEFILE FileName, "TOTAL," & NUM_TO_STR(Grand)
    WRITEFILE FileName, "BEST," & Regions[BestRow]
    CLOSEFILE FileName
ENDPROCEDURE`,
    cases: [
      {
        label: "North and East tie at the top",
        setup: listSetup("Regions", "STRING", ["North", "South", "East", "West"])
          + gridSetup("Sales", "INTEGER", [
            [120, 80, 100],
            [90, 110, 70],
            [150, 60, 90],
            [40, 50, 60],
          ]),
        files: { "Report.txt": ["old report"] },
        after: `DECLARE Line : STRING
OUTPUT "${MARK}"
CALL SalesReport(Regions, Sales, "Report.txt")
OPENFILE "Report.txt" FOR READ
WHILE NOT EOF("Report.txt")
    READFILE "Report.txt", Line
    OUTPUT Line
ENDWHILE
CLOSEFILE "Report.txt"`,
      },
      {
        label: "West is the clear best region",
        setup: listSetup("Regions", "STRING", ["North", "South", "East", "West"])
          + gridSetup("Sales", "INTEGER", [
            [10, 20, 30],
            [40, 50, 60],
            [70, 80, 90],
            [100, 110, 120],
          ]),
        files: { "Report.txt": ["old report", "second stale line"] },
        after: `DECLARE Line : STRING
OUTPUT "${MARK}"
CALL SalesReport(Regions, Sales, "Report.txt")
OPENFILE "Report.txt" FOR READ
WHILE NOT EOF("Report.txt")
    READFILE "Report.txt", Line
    OUTPUT Line
ENDWHILE
CLOSEFILE "Report.txt"`,
      },
      {
        label: "small totals with East best",
        setup: listSetup("Regions", "STRING", ["North", "South", "East", "West"])
          + gridSetup("Sales", "INTEGER", [
            [0, 0, 0],
            [5, 5, 5],
            [20, 10, 5],
            [7, 8, 9],
          ]),
        files: { "Report.txt": [] },
        after: `DECLARE Line : STRING
OUTPUT "${MARK}"
CALL SalesReport(Regions, Sales, "Report.txt")
OPENFILE "Report.txt" FOR READ
WHILE NOT EOF("Report.txt")
    READFILE "Report.txt", Line
    OUTPUT Line
ENDWHILE
CLOSEFILE "Report.txt"`,
      },
    ],
  },

  {
    id: "orig-proj-10",
    title: "Log file level summary",
    source: "原创 · 综合 · 文件读取 + 日志统计",
    marks: 11,
    difficulty: 3,
    chapter: "Ch11 Programming",
    requirement: "PROCEDURE LogSummary(BYVAL FileName : STRING)",
    prompt: [
      "A monitoring system writes a log file. Every line has the form `LEVEL:message`, where",
      "`LEVEL` is `INFO`, `WARN` or `ERROR` and `message` contains no colon.",
      "",
      "A procedure `LogSummary()` reads a log file and reports how many lines there are at",
      "each level.",
      "",
      "```",
      "PROCEDURE LogSummary(BYVAL FileName : STRING)",
      "```",
      "",
      "The procedure must:",
      "- open the file, read every line and close the file",
      "- extract the level from each line using string handling",
      "- count the lines at each of the three levels",
      "- output the counts in the order `INFO`, `WARN`, `ERROR`, then the level with the highest count",
      "- if two levels tie, the one that appears first in that order is reported as busiest",
      "",
      "Output exactly:",
      "",
      "```",
      "INFO = <count>",
      "WARN = <count>",
      "ERROR = <count>",
      "Busiest = <level>",
      "```",
      "",
      "为便于自动判分,前三行固定按 `INFO`、`WARN`、`ERROR` 的顺序输出,最后一行固定为 `Busiest = <出现次数最多的级别>`。"
    ].join("\n"),
    model: `PROCEDURE LogSummary(BYVAL FileName : STRING)
    DECLARE Levels : ARRAY[1:3] OF STRING
    DECLARE Counts : ARRAY[1:3] OF INTEGER
    DECLARE Line : STRING
    DECLARE Level : STRING
    DECLARE Cut : INTEGER
    DECLARE I : INTEGER
    DECLARE Best : INTEGER
    Levels[1] <- "INFO"
    Levels[2] <- "WARN"
    Levels[3] <- "ERROR"
    FOR I <- 1 TO 3
        Counts[I] <- 0
    NEXT I
    OPENFILE FileName FOR READ
    WHILE NOT EOF(FileName)
        READFILE FileName, Line
        Cut <- 0
        FOR I <- 1 TO LENGTH(Line)
            IF MID(Line, I, 1) = ":" AND Cut = 0 THEN
                Cut <- I
            ENDIF
        NEXT I
        IF Cut > 0 THEN
            Level <- LEFT(Line, Cut - 1)
            FOR I <- 1 TO 3
                IF Level = Levels[I] THEN
                    Counts[I] <- Counts[I] + 1
                ENDIF
            NEXT I
        ENDIF
    ENDWHILE
    CLOSEFILE FileName
    FOR I <- 1 TO 3
        OUTPUT Levels[I], " = ", Counts[I]
    NEXT I
    Best <- 1
    FOR I <- 2 TO 3
        IF Counts[I] > Counts[Best] THEN
            Best <- I
        ENDIF
    NEXT I
    OUTPUT "Busiest = ", Levels[Best]
ENDPROCEDURE`,
    cases: [
      {
        label: "INFO is the busiest",
        files: {
          "SystemA.log": [
            "INFO:sensor 1 online",
            "WARN:sensor 2 low battery",
            "INFO:sensor 3 online",
            "ERROR:sensor 4 offline",
            "INFO:report sent",
          ],
        },
        after: `OUTPUT "${MARK}"
CALL LogSummary("SystemA.log")`,
      },
      {
        label: "ERROR is the busiest",
        files: {
          "SystemB.log": [
            "WARN:door open",
            "WARN:door closed",
            "ERROR:camera fault",
            "INFO:heartbeat",
            "ERROR:disk full",
            "ERROR:fan failure",
          ],
        },
        after: `OUTPUT "${MARK}"
CALL LogSummary("SystemB.log")`,
      },
      {
        label: "WARN is the busiest",
        files: {
          "SystemC.log": [
            "INFO:start",
            "INFO:ready",
            "WARN:queue long",
            "WARN:retry",
            "WARN:recovered",
            "ERROR:timeout",
          ],
        },
        after: `OUTPUT "${MARK}"
CALL LogSummary("SystemC.log")`,
      },
    ],
  },

  {
    id: "orig-proj-11",
    title: "Temperature grid analysis",
    source: "原创 · 综合 · 2D 数组 + 温度分析",
    marks: 11,
    difficulty: 3,
    chapter: "Ch10 Data types and structures",
    requirement: "PROCEDURE TempReport(BYVAL Temps : ARRAY[1:3, 1:7] OF REAL)",
    prompt: [
      "A weather station records the daily temperature for three weeks in the 2D array",
      "`Temps`: row 1 is week 1, row 2 is week 2, row 3 is week 3, and each row has seven",
      "daily readings.",
      "",
      "A procedure `TempReport()` analyses the readings.",
      "",
      "```",
      "PROCEDURE TempReport(BYVAL Temps : ARRAY[1:3, 1:7] OF REAL)",
      "```",
      "",
      "The procedure must:",
      "- calculate and output the average temperature for each week, rounded to 1 decimal place",
      "- find the hottest reading in the whole grid; if the hottest value occurs more than once, use the first one in row order",
      "- count how many readings are strictly greater than 25.0",
      "",
      "Output exactly, in this order:",
      "",
      "```",
      "Week 1 average: <average>",
      "Week 2 average: <average>",
      "Week 3 average: <average>",
      "Hottest: <temperature> week <week> day <day>",
      "Days above 25: <count>",
      "```",
      "",
      "为便于自动判分,先按周输出三行 `Week <周> average: <平均温度>`,再输出 `Hottest: <温度> week <周> day <日>` 和 `Days above 25: <天数>`。"
    ].join("\n"),
    model: `PROCEDURE TempReport(BYVAL Temps : ARRAY[1:3, 1:7] OF REAL)
    DECLARE Week : INTEGER
    DECLARE Day : INTEGER
    DECLARE Total : REAL
    DECLARE Hottest : REAL
    DECLARE HotWeek : INTEGER
    DECLARE HotDay : INTEGER
    DECLARE Above : INTEGER
    Hottest <- Temps[1, 1]
    HotWeek <- 1
    HotDay <- 1
    Above <- 0
    FOR Week <- 1 TO 3
        Total <- 0
        FOR Day <- 1 TO 7
            Total <- Total + Temps[Week, Day]
            IF Temps[Week, Day] > Hottest THEN
                Hottest <- Temps[Week, Day]
                HotWeek <- Week
                HotDay <- Day
            ENDIF
            IF Temps[Week, Day] > 25.0 THEN
                Above <- Above + 1
            ENDIF
        NEXT Day
        OUTPUT "Week ", Week, " average: ", ROUND(Total / 7, 1)
    NEXT Week
    OUTPUT "Hottest: ", Hottest, " week ", HotWeek, " day ", HotDay
    OUTPUT "Days above 25: ", Above
ENDPROCEDURE`,
    cases: [
      {
        label: "warming week in the middle",
        setup: gridSetup("Temps", "REAL", [
          [22.0, 23.5, 24.0, 25.5, 26.0, 24.5, 23.0],
          [27.0, 28.5, 30.0, 29.0, 26.5, 25.0, 24.0],
          [21.0, 20.0, 19.5, 22.0, 23.0, 24.0, 25.0],
        ]),
        after: `OUTPUT "${MARK}"
CALL TempReport(Temps)`,
      },
      {
        label: "flat cool, hot, mild weeks",
        setup: gridSetup("Temps", "REAL", [
          [20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0],
          [30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0],
          [25.0, 25.0, 25.0, 25.0, 25.0, 25.0, 25.0],
        ]),
        after: `OUTPUT "${MARK}"
CALL TempReport(Temps)`,
      },
      {
        label: "hot end to the month",
        setup: gridSetup("Temps", "REAL", [
          [15.5, 16.0, 17.5, 18.0, 19.5, 20.0, 21.0],
          [22.0, 23.0, 24.0, 25.0, 26.0, 27.0, 28.0],
          [29.0, 28.0, 27.0, 26.0, 25.0, 24.0, 23.0],
        ]),
        after: `OUTPUT "${MARK}"
CALL TempReport(Temps)`,
      },
    ],
  },

  {
    id: "orig-proj-12",
    title: "Password policy checker",
    source: "原创 · 综合 · 字符串 + 密码策略",
    marks: 12,
    difficulty: 3,
    chapter: "Ch11 Programming",
    requirement: "PROCEDURE CheckPassword(BYVAL Password : STRING)",
    prompt: [
      "A computer system checks every new password against five rules:",
      "1. it has at least 8 characters",
      "2. it contains at least one upper-case letter",
      "3. it contains at least one lower-case letter",
      "4. it contains at least one digit",
      "5. it contains no spaces",
      "",
      "A procedure `CheckPassword()` reports whether each rule is met and whether the",
      "password is accepted.",
      "",
      "```",
      "PROCEDURE CheckPassword(BYVAL Password : STRING)",
      "```",
      "",
      "The procedure must examine every character of `Password` and output five rule lines",
      "in this order, using `PASS` or `FAIL`, then one result line:",
      "",
      "```",
      "Length: PASS",
      "Upper: PASS",
      "Lower: PASS",
      "Digit: PASS",
      "Space: PASS",
      "Result: ACCEPT",
      "```",
      "",
      "`Space: PASS` means the password contains no space. `Result: ACCEPT` is output",
      "only when all five rules pass; otherwise `Result: REJECT` is output.",
      "",
      "为便于自动判分,五条规则固定按 `Length`、`Upper`、`Lower`、`Digit`、`Space` 的顺序输出 `PASS` 或 `FAIL`,最后一行固定为 `Result: ACCEPT` 或 `Result: REJECT`。"
    ].join("\n"),
    model: `PROCEDURE CheckPassword(BYVAL Password : STRING)
    DECLARE I : INTEGER
    DECLARE ThisChar : STRING
    DECLARE HasUpper : BOOLEAN
    DECLARE HasLower : BOOLEAN
    DECLARE HasDigit : BOOLEAN
    DECLARE HasSpace : BOOLEAN
    HasUpper <- FALSE
    HasLower <- FALSE
    HasDigit <- FALSE
    HasSpace <- FALSE
    FOR I <- 1 TO LENGTH(Password)
        ThisChar <- MID(Password, I, 1)
        IF ThisChar >= "A" AND ThisChar <= "Z" THEN
            HasUpper <- TRUE
        ENDIF
        IF ThisChar >= "a" AND ThisChar <= "z" THEN
            HasLower <- TRUE
        ENDIF
        IF ThisChar >= "0" AND ThisChar <= "9" THEN
            HasDigit <- TRUE
        ENDIF
        IF ThisChar = " " THEN
            HasSpace <- TRUE
        ENDIF
    NEXT I
    IF LENGTH(Password) >= 8 THEN
        OUTPUT "Length: PASS"
    ELSE
        OUTPUT "Length: FAIL"
    ENDIF
    IF HasUpper = TRUE THEN
        OUTPUT "Upper: PASS"
    ELSE
        OUTPUT "Upper: FAIL"
    ENDIF
    IF HasLower = TRUE THEN
        OUTPUT "Lower: PASS"
    ELSE
        OUTPUT "Lower: FAIL"
    ENDIF
    IF HasDigit = TRUE THEN
        OUTPUT "Digit: PASS"
    ELSE
        OUTPUT "Digit: FAIL"
    ENDIF
    IF HasSpace = FALSE THEN
        OUTPUT "Space: PASS"
    ELSE
        OUTPUT "Space: FAIL"
    ENDIF
    IF LENGTH(Password) >= 8 AND HasUpper = TRUE AND HasLower = TRUE AND HasDigit = TRUE AND HasSpace = FALSE THEN
        OUTPUT "Result: ACCEPT"
    ELSE
        OUTPUT "Result: REJECT"
    ENDIF
ENDPROCEDURE`,
    cases: [
      {
        label: "Tiger2026 is accepted",
        after: `OUTPUT "${MARK}"
CALL CheckPassword("Tiger2026")`,
      },
      {
        label: "no upper-case letter",
        after: `OUTPUT "${MARK}"
CALL CheckPassword("tiger2026")`,
      },
      {
        label: "contains a space",
        after: `OUTPUT "${MARK}"
CALL CheckPassword("Tiger 26")`,
      },
    ],
  },

  {
    id: "orig-proj-13",
    title: "Next bus from a timetable",
    source: "原创 · 综合 · 2D 数组 + 时刻查找",
    marks: 11,
    difficulty: 3,
    chapter: "Ch11 Programming",
    requirement: "PROCEDURE NextBus(BYVAL Times : ARRAY[1:4, 1:5] OF INTEGER, BYVAL Route : INTEGER, BYVAL Now : INTEGER)",
    prompt: [
      "A bus company stores departures in a 2D array `Times`: each of the four rows is a",
      "route and each row contains five departure times in ascending order.",
      "",
      "Each time is stored as the number of minutes after midnight, for example 08:30 is",
      "510. `Now` is the current time in the same form.",
      "",
      "A procedure `NextBus()` reports the next departure on one route.",
      "",
      "```",
      "PROCEDURE NextBus(BYVAL Times : ARRAY[1:4, 1:5] OF INTEGER, BYVAL Route : INTEGER, BYVAL Now : INTEGER)",
      "```",
      "",
      "The procedure must:",
      "- output `Invalid request` if `Route` is not 1 to 4 or `Now` is not 0 to 1439",
      "- otherwise find the earliest departure in that route that is at or after `Now`",
      "- if there is one, output it as `Next bus: HH:MM` with two digits for the hour and two digits for the minute",
      "- if there is no later departure, output `No more buses`",
      "",
      "Use `DIV` and `MOD` to convert the stored minutes into hours and minutes.",
      "",
      "为便于自动判分,有效请求只输出一行 `Next bus: HH:MM` 或 `No more buses`;无效请求只输出 `Invalid request`。"
    ].join("\n"),
    model: `PROCEDURE NextBus(BYVAL Times : ARRAY[1:4, 1:5] OF INTEGER, BYVAL Route : INTEGER, BYVAL Now : INTEGER)
    DECLARE Column : INTEGER
    DECLARE Found : BOOLEAN
    DECLARE NextTime : INTEGER
    DECLARE Hours : INTEGER
    DECLARE Minutes : INTEGER
    DECLARE TimeText : STRING
    IF Route < 1 OR Route > 4 OR Now < 0 OR Now > 1439 THEN
        OUTPUT "Invalid request"
    ELSE
        Found <- FALSE
        Column <- 1
        WHILE Column <= 5 AND Found = FALSE
            IF Times[Route, Column] >= Now THEN
                NextTime <- Times[Route, Column]
                Found <- TRUE
            ENDIF
            Column <- Column + 1
        ENDWHILE
        IF Found = TRUE THEN
            Hours <- NextTime DIV 60
            Minutes <- NextTime MOD 60
            TimeText <- ""
            IF Hours < 10 THEN
                TimeText <- "0" & NUM_TO_STR(Hours)
            ELSE
                TimeText <- NUM_TO_STR(Hours)
            ENDIF
            TimeText <- TimeText & ":"
            IF Minutes < 10 THEN
                TimeText <- TimeText & "0" & NUM_TO_STR(Minutes)
            ELSE
                TimeText <- TimeText & NUM_TO_STR(Minutes)
            ENDIF
            OUTPUT "Next bus: ", TimeText
        ELSE
            OUTPUT "No more buses"
        ENDIF
    ENDIF
ENDPROCEDURE`,
    cases: [
      {
        label: "route 2 at 08:25",
        setup: gridSetup("Times", "INTEGER", [
          [420, 480, 540, 600, 660],
          [450, 510, 570, 630, 690],
          [480, 540, 600, 660, 720],
          [1080, 1140, 1200, 1260, 1320],
        ]),
        after: `OUTPUT "${MARK}"
CALL NextBus(Times, 2, 505)`,
      },
      {
        label: "route 4 after the last bus",
        setup: gridSetup("Times", "INTEGER", [
          [420, 480, 540, 600, 660],
          [450, 510, 570, 630, 690],
          [480, 540, 600, 660, 720],
          [1080, 1140, 1200, 1260, 1320],
        ]),
        after: `OUTPUT "${MARK}"
CALL NextBus(Times, 4, 1340)`,
      },
      {
        label: "route 5 does not exist",
        setup: gridSetup("Times", "INTEGER", [
          [420, 480, 540, 600, 660],
          [450, 510, 570, 630, 690],
          [480, 540, 600, 660, 720],
          [1080, 1140, 1200, 1260, 1320],
        ]),
        after: `OUTPUT "${MARK}"
CALL NextBus(Times, 5, 900)`,
      },
    ],
  },

  {
    id: "orig-proj-14",
    title: "Tournament league table",
    source: "原创 · 综合 · 积分排序 + 名次",
    marks: 12,
    difficulty: 3,
    chapter: "Ch09 Algorithm design",
    requirement: "PROCEDURE LeagueTable(BYVAL Teams : ARRAY[1:6] OF STRING, BYVAL Results : ARRAY[1:6, 1:6] OF CHAR)",
    prompt: [
      "A tournament has six teams. `Teams` holds their names and `Results` is a 2D array",
      "of characters. `Results[I, J]` is team `I`'s result against the team in column `J`:",
      "`W` for a win, `D` for a draw, `L` for a loss and `-` where no match was played.",
      "",
      "A procedure `LeagueTable()` calculates each team's points and outputs the final",
      "table.",
      "",
      "```",
      "PROCEDURE LeagueTable(BYVAL Teams : ARRAY[1:6] OF STRING, BYVAL Results : ARRAY[1:6, 1:6] OF CHAR)",
      "```",
      "",
      "The procedure must:",
      "- calculate points from row `I`: a win scores 3, a draw scores 1 and a loss scores 0",
      "- sort the teams into descending order of points, changing both the names and the points",
      "- keep the original array order when two teams have the same points",
      "- output every team with its place, using `1` for the highest points",
      "",
      "Output exactly:",
      "",
      "```",
      "1. <team> <points>",
      "2. <team> <points>",
      "...one line for each of the six teams...",
      "```",
      "",
      "为便于自动判分,按名次每行输出 `<名次>. <队名> <积分>`;积分相同时,原数组中靠前的队名次更高。"
    ].join("\n"),
    model: `PROCEDURE LeagueTable(BYVAL Teams : ARRAY[1:6] OF STRING, BYVAL Results : ARRAY[1:6, 1:6] OF CHAR)
    DECLARE Points : ARRAY[1:6] OF INTEGER
    DECLARE I : INTEGER
    DECLARE J : INTEGER
    DECLARE Best : INTEGER
    DECLARE TempPoints : INTEGER
    DECLARE TempTeam : STRING
    FOR I <- 1 TO 6
        Points[I] <- 0
        FOR J <- 1 TO 6
            IF Results[I, J] = 'W' THEN
                Points[I] <- Points[I] + 3
            ELSE
                IF Results[I, J] = 'D' THEN
                    Points[I] <- Points[I] + 1
                ENDIF
            ENDIF
        NEXT J
    NEXT I
    FOR I <- 1 TO 5
        Best <- I
        FOR J <- I + 1 TO 6
            IF Points[J] > Points[Best] THEN
                Best <- J
            ENDIF
        NEXT J
        IF Best <> I THEN
            TempPoints <- Points[I]
            Points[I] <- Points[Best]
            Points[Best] <- TempPoints
            TempTeam <- Teams[I]
            Teams[I] <- Teams[Best]
            Teams[Best] <- TempTeam
        ENDIF
    NEXT I
    FOR I <- 1 TO 6
        OUTPUT I, ". ", Teams[I], " ", Points[I]
    NEXT I
ENDPROCEDURE`,
    cases: [
      {
        label: "three teams tie on ten points",
        setup: leagueSetup(TEAMS, [
          [1, 2, "W"], [1, 3, "D"], [1, 4, "W"], [1, 5, "L"], [1, 6, "W"],
          [2, 3, "W"], [2, 4, "D"], [2, 5, "W"], [2, 6, "W"],
          [3, 4, "W"], [3, 5, "W"], [3, 6, "W"],
          [4, 5, "W"], [4, 6, "W"],
          [5, 6, "D"],
        ]),
        after: `OUTPUT "${MARK}"
CALL LeagueTable(Teams, Results)`,
      },
      {
        label: "City wins clearly",
        setup: leagueSetup(TEAMS, [
          [1, 2, "L"], [1, 3, "W"], [1, 4, "D"], [1, 5, "W"], [1, 6, "W"],
          [2, 3, "W"], [2, 4, "W"], [2, 5, "D"], [2, 6, "W"],
          [3, 4, "L"], [3, 5, "W"], [3, 6, "D"],
          [4, 5, "W"], [4, 6, "W"],
          [5, 6, "L"],
        ]),
        after: `OUTPUT "${MARK}"
CALL LeagueTable(Teams, Results)`,
      },
      {
        label: "City and United tie at the top",
        setup: leagueSetup(TEAMS, [
          [1, 2, "D"], [1, 3, "L"], [1, 4, "L"], [1, 5, "W"], [1, 6, "W"],
          [2, 3, "D"], [2, 4, "W"], [2, 5, "W"], [2, 6, "W"],
          [3, 4, "W"], [3, 5, "D"], [3, 6, "W"],
          [4, 5, "L"], [4, 6, "W"],
          [5, 6, "W"],
        ]),
        after: `OUTPUT "${MARK}"
CALL LeagueTable(Teams, Results)`,
      },
    ],
  },
];
