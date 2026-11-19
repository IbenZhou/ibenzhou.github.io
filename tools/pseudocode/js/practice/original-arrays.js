// Original Cambridge 9618 questions written for this bank.
// New scenarios in exam style; not past-paper questions.
//
// Every case supplies its own setup block so the array contents differ.
// `after` prints the stored result (or CALLs the requested routine, then prints).

const MARK = "===RESULT===";

function declareList(name, count) {
  return `DECLARE ${name} : ARRAY[1:${count}] OF INTEGER\n`;
}

function listSetup(name, values) {
  let code = declareList(name, values.length);
  values.forEach((value, index) => {
    code += `${name}[${index + 1}] <- ${value}\n`;
  });
  return code;
}

function declareGrid(name, rows, columns) {
  return `DECLARE ${name} : ARRAY[1:${rows},1:${columns}] OF INTEGER\n`;
}

function gridSetup(name, rows) {
  let code = declareGrid(name, rows.length, rows[0].length);
  rows.forEach((row, r) => {
    row.forEach((value, c) => {
      code += `${name}[${r + 1}, ${c + 1}] <- ${value}\n`;
    });
  });
  return code;
}

function printListAfter(name, count) {
  return `OUTPUT "${MARK}"
DECLARE PrintIndex : INTEGER
FOR PrintIndex <- 1 TO ${count}
    OUTPUT ${name}[PrintIndex]
NEXT PrintIndex`;
}

function printGridAfter(name, rows, columns) {
  const cells = [];
  for (let c = 1; c <= columns; c += 1) cells.push(`${name}[PrintRow, ${c}]`);
  const line = cells.join(', " ", ');
  return `OUTPUT "${MARK}"
DECLARE PrintRow : INTEGER
FOR PrintRow <- 1 TO ${rows}
    OUTPUT ${line}
NEXT PrintRow`;
}

export const ARRAYS = [
  // ---------------------------------------------------------------- 1-D arrays
  {
    id: "orig-1d-fill-formula",
    title: "Estimated steps from a formula",
    source: "原创 · §10.2 一维数组",
    marks: 4,
    difficulty: 1,
    chapter: "Ch10 Data types and structures",
    requirement: "Fill the global array Steps using Steps[I] <- Base * I + I * I",
    prompt: [
      "A fitness app estimates the number of steps taken in workout session `I` using the formula",
      "",
      "`Steps[I] <- Base * I + I * I`",
      "",
      "`Steps` is a 1D integer array declared as `ARRAY[1:6] OF INTEGER` and `Base` holds a positive",
      "integer. Both are already declared.",
      "",
      "Write pseudocode to fill `Steps` for every index from 1 to 6 using the formula.",
      "Your code must not output anything."
    ].join("\n"),
    model: `DECLARE Index : INTEGER
FOR Index <- 1 TO 6
    Steps[Index] <- Base * Index + Index * Index
NEXT Index`,
    cases: [
      {
        label: "Base = 20",
        setup: listSetup("Steps", [0, 0, 0, 0, 0, 0]) + "DECLARE Base : INTEGER\nBase <- 20",
        after: printListAfter("Steps", 6),
      },
      {
        label: "Base = 35",
        setup: listSetup("Steps", [0, 0, 0, 0, 0, 0]) + "DECLARE Base : INTEGER\nBase <- 35",
        after: printListAfter("Steps", 6),
      },
      {
        label: "Base = 50",
        setup: listSetup("Steps", [0, 0, 0, 0, 0, 0]) + "DECLARE Base : INTEGER\nBase <- 50",
        after: printListAfter("Steps", 6),
      },
    ],
  },

  {
    id: "orig-1d-total-average",
    title: "Café takings: total and mean",
    source: "原创 · §10.2 一维数组",
    marks: 5,
    difficulty: 1,
    chapter: "Ch10 Data types and structures",
    requirement: "Total the six values into Total and store the mean in Average",
    prompt: [
      "Daily takings for a café are stored in the 1D integer array `Takings`, declared as",
      "`ARRAY[1:6] OF INTEGER`. The array already holds six values.",
      "",
      "Write pseudocode to:",
      "- total the six values and store the total in `Total`",
      "- calculate the mean and store it in `Average`, rounded to **one decimal place** using `ROUND`.",
      "",
      "Your code must not output anything."
    ].join("\n"),
    model: `DECLARE Total : INTEGER
DECLARE Average : REAL
DECLARE Index : INTEGER
Total <- 0
FOR Index <- 1 TO 6
    Total <- Total + Takings[Index]
NEXT Index
Average <- ROUND(Total / 6, 1)`,
    cases: [
      {
        label: "120 95 140 85 110 150",
        setup: listSetup("Takings", [120, 95, 140, 85, 110, 150]),
        after: `OUTPUT "${MARK}"
OUTPUT Total
OUTPUT Average`,
      },
      {
        label: "60 75 55 90 80 70",
        setup: listSetup("Takings", [60, 75, 55, 90, 80, 70]),
        after: `OUTPUT "${MARK}"
OUTPUT Total
OUTPUT Average`,
      },
      {
        label: "210 180 195 240 165 200",
        setup: listSetup("Takings", [210, 180, 195, 240, 165, 200]),
        after: `OUTPUT "${MARK}"
OUTPUT Total
OUTPUT Average`,
      },
      {
        label: "0 40 25 35 30 20",
        setup: listSetup("Takings", [0, 40, 25, 35, 30, 20]),
        after: `OUTPUT "${MARK}"
OUTPUT Total
OUTPUT Average`,
      },
    ],
  },

  {
    id: "orig-1d-max-index",
    title: "Hottest day and its index",
    source: "原创 · §10.2 一维数组",
    marks: 5,
    difficulty: 1,
    chapter: "Ch10 Data types and structures",
    requirement: "Store the highest value in Hottest and its index in HottestDay",
    prompt: [
      "Temperatures recorded over six days are stored in the 1D integer array `Reading`, declared as",
      "`ARRAY[1:6] OF INTEGER`. The highest reading is unique.",
      "",
      "Write pseudocode to find the highest value and the day on which it occurred:",
      "- store the highest value in `Hottest`",
      "- store its index in `HottestDay`.",
      "",
      "Your code must not output anything."
    ].join("\n"),
    model: `DECLARE Hottest : INTEGER
DECLARE HottestDay : INTEGER
DECLARE Index : INTEGER
Hottest <- Reading[1]
HottestDay <- 1
FOR Index <- 2 TO 6
    IF Reading[Index] > Hottest THEN
        Hottest <- Reading[Index]
        HottestDay <- Index
    ENDIF
NEXT Index`,
    cases: [
      {
        label: "14 21 9 27 18 12",
        setup: listSetup("Reading", [14, 21, 9, 27, 18, 12]),
        after: `OUTPUT "${MARK}"
OUTPUT Hottest
OUTPUT HottestDay`,
      },
      {
        label: "31 12 25 19 8 22",
        setup: listSetup("Reading", [31, 12, 25, 19, 8, 22]),
        after: `OUTPUT "${MARK}"
OUTPUT Hottest
OUTPUT HottestDay`,
      },
      {
        label: "5 9 12 16 20 26",
        setup: listSetup("Reading", [5, 9, 12, 16, 20, 26]),
        after: `OUTPUT "${MARK}"
OUTPUT Hottest
OUTPUT HottestDay`,
      },
    ],
  },

  {
    id: "orig-1d-min-position",
    title: "Lowest stock level and its shelf",
    source: "原创 · §10.2 一维数组",
    marks: 5,
    difficulty: 1,
    chapter: "Ch10 Data types and structures",
    requirement: "Store the lowest value in Lowest and its index in LowestShelf",
    prompt: [
      "Stock levels on six shelves are stored in the 1D integer array `Stock`, declared as",
      "`ARRAY[1:6] OF INTEGER`. The lowest level is unique.",
      "",
      "Write pseudocode to find the lowest value and its position:",
      "- store the lowest value in `Lowest`",
      "- store the index of that shelf in `LowestShelf`.",
      "",
      "Your code must not output anything."
    ].join("\n"),
    model: `DECLARE Lowest : INTEGER
DECLARE LowestShelf : INTEGER
DECLARE Index : INTEGER
Lowest <- Stock[1]
LowestShelf <- 1
FOR Index <- 2 TO 6
    IF Stock[Index] < Lowest THEN
        Lowest <- Stock[Index]
        LowestShelf <- Index
    ENDIF
NEXT Index`,
    cases: [
      {
        label: "48 33 51 29 40 36",
        setup: listSetup("Stock", [48, 33, 51, 29, 40, 36]),
        after: `OUTPUT "${MARK}"
OUTPUT Lowest
OUTPUT LowestShelf`,
      },
      {
        label: "12 45 38 50 27 31",
        setup: listSetup("Stock", [12, 45, 38, 50, 27, 31]),
        after: `OUTPUT "${MARK}"
OUTPUT Lowest
OUTPUT LowestShelf`,
      },
      {
        label: "60 55 47 39 44 21",
        setup: listSetup("Stock", [60, 55, 47, 39, 44, 21]),
        after: `OUTPUT "${MARK}"
OUTPUT Lowest
OUTPUT LowestShelf`,
      },
    ],
  },

  {
    id: "orig-1d-count-above",
    title: "Scores above the pass mark",
    source: "原创 · §10.2 一维数组",
    marks: 4,
    difficulty: 1,
    chapter: "Ch10 Data types and structures",
    requirement: "Count values strictly greater than Limit and store the count in Passed",
    prompt: [
      "Test scores are stored in the 1D integer array `Score`, declared as `ARRAY[1:6] OF INTEGER`.",
      "The variable `Limit` holds the pass mark.",
      "",
      "Write pseudocode to count how many scores are **strictly greater than** `Limit` and store",
      "the count in `Passed`.",
      "",
      "Your code must not output anything."
    ].join("\n"),
    model: `DECLARE Passed : INTEGER
DECLARE Index : INTEGER
Passed <- 0
FOR Index <- 1 TO 6
    IF Score[Index] > Limit THEN
        Passed <- Passed + 1
    ENDIF
NEXT Index`,
    cases: [
      {
        label: "limit 60",
        setup: listSetup("Score", [45, 72, 68, 90, 55, 61]) + "DECLARE Limit : INTEGER\nLimit <- 60",
        after: `OUTPUT "${MARK}"
OUTPUT Passed`,
      },
      {
        label: "limit 40",
        setup: listSetup("Score", [30, 25, 40, 35, 20, 50]) + "DECLARE Limit : INTEGER\nLimit <- 40",
        after: `OUTPUT "${MARK}"
OUTPUT Passed`,
      },
      {
        label: "limit 100",
        setup: listSetup("Score", [88, 92, 76, 95, 81, 89]) + "DECLARE Limit : INTEGER\nLimit <- 100",
        after: `OUTPUT "${MARK}"
OUTPUT Passed`,
      },
      {
        label: "limit 5",
        setup: listSetup("Score", [10, 20, 30, 40, 50, 60]) + "DECLARE Limit : INTEGER\nLimit <- 5",
        after: `OUTPUT "${MARK}"
OUTPUT Passed`,
      },
    ],
  },

  {
    id: "orig-1d-reverse",
    title: "Reverse the queue in place",
    source: "原创 · §10.2 一维数组",
    marks: 6,
    difficulty: 1,
    chapter: "Ch10 Data types and structures",
    requirement: "Reverse the six values of Queue without using a second array",
    prompt: [
      "Six jobs are stored in the 1D integer array `Queue`, declared as `ARRAY[1:6] OF INTEGER`.",
      "",
      "Write pseudocode to reverse the order of the values **in place**, so that `Queue[1]` swaps",
      "with `Queue[6]`, `Queue[2]` swaps with `Queue[5]`, and so on.",
      "",
      "You must not use a second array. Your code must not output anything."
    ].join("\n"),
    model: `DECLARE Held : INTEGER
DECLARE Index : INTEGER
FOR Index <- 1 TO 3
    Held <- Queue[Index]
    Queue[Index] <- Queue[7 - Index]
    Queue[7 - Index] <- Held
NEXT Index`,
    cases: [
      {
        label: "4 8 15 16 23 42",
        setup: listSetup("Queue", [4, 8, 15, 16, 23, 42]),
        after: printListAfter("Queue", 6),
      },
      {
        label: "7 7 1 9 3 5",
        setup: listSetup("Queue", [7, 7, 1, 9, 3, 5]),
        after: printListAfter("Queue", 6),
      },
      {
        label: "100 200 300 400 500 600",
        setup: listSetup("Queue", [100, 200, 300, 400, 500, 600]),
        after: printListAfter("Queue", 6),
      },
    ],
  },

  {
    id: "orig-1d-shift",
    title: "Shift the readings one place right",
    source: "原创 · §10.2 一维数组",
    marks: 7,
    difficulty: 2,
    chapter: "Ch10 Data types and structures",
    requirement: "Shift every element of Belt one place right, with the last value wrapping to Belt[1]",
    prompt: [
      "Six counter readings are stored in the 1D integer array `Belt`, declared as",
      "`ARRAY[1:6] OF INTEGER`.",
      "",
      "Write pseudocode to shift every value one place to the **right**:",
      "- the value in `Belt[1]` moves to `Belt[2]`, `Belt[2]` moves to `Belt[3]`, and so on",
      "- the value that was in `Belt[6]` moves to `Belt[1]`.",
      "",
      "Use no more than one extra variable. Your code must not output anything."
    ].join("\n"),
    model: `DECLARE Held : INTEGER
DECLARE Index : INTEGER
Held <- Belt[6]
FOR Index <- 6 TO 2 STEP -1
    Belt[Index] <- Belt[Index - 1]
NEXT Index
Belt[1] <- Held`,
    cases: [
      {
        label: "3 6 9 12 15 18",
        setup: listSetup("Belt", [3, 6, 9, 12, 15, 18]),
        after: printListAfter("Belt", 6),
      },
      {
        label: "11 22 33 44 55 66",
        setup: listSetup("Belt", [11, 22, 33, 44, 55, 66]),
        after: printListAfter("Belt", 6),
      },
      {
        label: "5 4 3 2 1 0",
        setup: listSetup("Belt", [5, 4, 3, 2, 1, 0]),
        after: printListAfter("Belt", 6),
      },
    ],
  },

  {
    id: "orig-1d-compare",
    title: "Compare expected and actual answers",
    source: "原创 · §10.2 一维数组",
    marks: 7,
    difficulty: 2,
    chapter: "Ch10 Data types and structures",
    requirement: "Compare Expected and Actual, storing Differences and FirstDiff",
    prompt: [
      "Two 1D integer arrays are declared, each as `ARRAY[1:6] OF INTEGER`: `Expected` holds the",
      "correct answers and `Actual` holds a student's answers.",
      "",
      "Write pseudocode to compare the arrays element by element and store:",
      "- the number of positions that differ in `Differences`",
      "- the index of the **first** position that differs in `FirstDiff`; store 0 if the arrays are",
      "  identical.",
      "",
      "Your code must not output anything."
    ].join("\n"),
    model: `DECLARE Differences : INTEGER
DECLARE FirstDiff : INTEGER
DECLARE Index : INTEGER
Differences <- 0
FirstDiff <- 0
FOR Index <- 1 TO 6
    IF Expected[Index] <> Actual[Index] THEN
        Differences <- Differences + 1
        IF FirstDiff = 0 THEN
            FirstDiff <- Index
        ENDIF
    ENDIF
NEXT Index`,
    cases: [
      {
        label: "identical",
        setup: listSetup("Expected", [12, 15, 9, 20, 7, 18]) + listSetup("Actual", [12, 15, 9, 20, 7, 18]),
        after: `OUTPUT "${MARK}"
OUTPUT Differences
OUTPUT FirstDiff`,
      },
      {
        label: "two differences",
        setup: listSetup("Expected", [12, 15, 9, 20, 7, 18]) + listSetup("Actual", [12, 14, 9, 20, 6, 18]),
        after: `OUTPUT "${MARK}"
OUTPUT Differences
OUTPUT FirstDiff`,
      },
      {
        label: "only the last differs",
        setup: listSetup("Expected", [40, 35, 50, 45, 30, 25]) + listSetup("Actual", [40, 35, 50, 45, 30, 20]),
        after: `OUTPUT "${MARK}"
OUTPUT Differences
OUTPUT FirstDiff`,
      },
      {
        label: "all reversed",
        setup: listSetup("Expected", [1, 2, 3, 4, 5, 6]) + listSetup("Actual", [6, 5, 4, 3, 2, 1]),
        after: `OUTPUT "${MARK}"
OUTPUT Differences
OUTPUT FirstDiff`,
      },
    ],
  },

  // ---------------------------------------------------------------- 2-D arrays
  {
    id: "orig-2d-row-totals",
    title: "Sales totals for each region",
    source: "原创 · §10.2 二维数组",
    marks: 7,
    difficulty: 2,
    chapter: "Ch10 Data types and structures",
    requirement: "Store the total of each row of Sales in RowTotal",
    prompt: [
      "A company records sales for 3 regions (rows) and 4 quarters (columns) in the 2D integer",
      "array `Sales`, declared as `ARRAY[1:3, 1:4] OF INTEGER`.",
      "",
      "`RowTotal` is a 1D integer array declared as `ARRAY[1:3] OF INTEGER`.",
      "",
      "Write pseudocode to store the total of each row of `Sales` in the corresponding element of",
      "`RowTotal`.",
      "",
      "Your code must not output anything."
    ].join("\n"),
    model: `DECLARE Row : INTEGER
DECLARE Column : INTEGER
FOR Row <- 1 TO 3
    RowTotal[Row] <- 0
    FOR Column <- 1 TO 4
        RowTotal[Row] <- RowTotal[Row] + Sales[Row, Column]
    NEXT Column
NEXT Row`,
    cases: [
      {
        label: "three regions",
        setup: gridSetup("Sales", [[12, 8, 15, 10], [9, 14, 7, 11], [20, 5, 18, 12]])
          + listSetup("RowTotal", [0, 0, 0]),
        after: printListAfter("RowTotal", 3),
      },
      {
        label: "small values",
        setup: gridSetup("Sales", [[3, 4, 5, 6], [10, 10, 10, 10], [0, 1, 0, 1]])
          + listSetup("RowTotal", [0, 0, 0]),
        after: printListAfter("RowTotal", 3),
      },
      {
        label: "large values",
        setup: gridSetup("Sales", [[25, 30, 15, 20], [18, 22, 28, 12], [40, 35, 45, 30]])
          + listSetup("RowTotal", [0, 0, 0]),
        after: printListAfter("RowTotal", 3),
      },
    ],
  },

  {
    id: "orig-2d-col-totals",
    title: "Rainfall totals for each region",
    source: "原创 · §10.2 二维数组",
    marks: 7,
    difficulty: 2,
    chapter: "Ch10 Data types and structures",
    requirement: "Store the total of each column of Rainfall in ColTotal",
    prompt: [
      "Weekly rainfall for 4 weeks (rows) and 3 regions (columns) is stored in the 2D integer",
      "array `Rainfall`, declared as `ARRAY[1:4, 1:3] OF INTEGER`.",
      "",
      "`ColTotal` is a 1D integer array declared as `ARRAY[1:3] OF INTEGER`.",
      "",
      "Write pseudocode to store the total of each column of `Rainfall` in the corresponding",
      "element of `ColTotal`.",
      "",
      "Your code must not output anything."
    ].join("\n"),
    model: `DECLARE Row : INTEGER
DECLARE Column : INTEGER
FOR Column <- 1 TO 3
    ColTotal[Column] <- 0
NEXT Column
FOR Row <- 1 TO 4
    FOR Column <- 1 TO 3
        ColTotal[Column] <- ColTotal[Column] + Rainfall[Row, Column]
    NEXT Column
NEXT Row`,
    cases: [
      {
        label: "four weeks",
        setup: gridSetup("Rainfall", [[12, 7, 9], [5, 14, 8], [10, 3, 11], [8, 9, 6]])
          + listSetup("ColTotal", [0, 0, 0]),
        after: printListAfter("ColTotal", 3),
      },
      {
        label: "dry first week",
        setup: gridSetup("Rainfall", [[0, 0, 0], [6, 2, 4], [3, 9, 5], [7, 1, 8]])
          + listSetup("ColTotal", [0, 0, 0]),
        after: printListAfter("ColTotal", 3),
      },
      {
        label: "wet season",
        setup: gridSetup("Rainfall", [[20, 15, 10], [18, 16, 14], [25, 22, 19], [12, 11, 13]])
          + listSetup("ColTotal", [0, 0, 0]),
        after: printListAfter("ColTotal", 3),
      },
    ],
  },

  {
    id: "orig-2d-diagonal",
    title: "Total of the main diagonal",
    source: "原创 · §10.2 二维数组",
    marks: 7,
    difficulty: 2,
    chapter: "Ch10 Data types and structures",
    requirement: "Add the main diagonal of Grid and store the sum in Diagonal",
    prompt: [
      "A 4 × 4 grid of integers is stored in `Grid`, declared as `ARRAY[1:4, 1:4] OF INTEGER`.",
      "",
      "Write pseudocode to add the values on the **main diagonal** — `Grid[1, 1]`, `Grid[2, 2]`,",
      "`Grid[3, 3]` and `Grid[4, 4]` — and store the sum in `Diagonal`.",
      "",
      "Your code must not output anything."
    ].join("\n"),
    model: `DECLARE Diagonal : INTEGER
DECLARE Index : INTEGER
Diagonal <- 0
FOR Index <- 1 TO 4
    Diagonal <- Diagonal + Grid[Index, Index]
NEXT Index`,
    cases: [
      {
        label: "mixed grid",
        setup: gridSetup("Grid", [[5, 9, 2, 4], [8, 3, 7, 1], [6, 2, 9, 5], [4, 8, 1, 7]]),
        after: `OUTPUT "${MARK}"
OUTPUT Diagonal`,
      },
      {
        label: "identity grid",
        setup: gridSetup("Grid", [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]),
        after: `OUTPUT "${MARK}"
OUTPUT Diagonal`,
      },
      {
        label: "all twos",
        setup: gridSetup("Grid", [[2, 2, 2, 2], [2, 2, 2, 2], [2, 2, 2, 2], [2, 2, 2, 2]]),
        after: `OUTPUT "${MARK}"
OUTPUT Diagonal`,
      },
    ],
  },

  {
    id: "orig-2d-transpose",
    title: "Transpose a 3 by 4 grid",
    source: "原创 · §10.2 二维数组",
    marks: 8,
    difficulty: 2,
    chapter: "Ch10 Data types and structures",
    requirement: "Copy Source into Copy so that Copy is the transpose of Source",
    prompt: [
      "`Source` is a 2D integer array declared as `ARRAY[1:3, 1:4] OF INTEGER`.",
      "`Copy` is a 2D integer array declared as `ARRAY[1:4, 1:3] OF INTEGER`.",
      "",
      "Write pseudocode to copy every value of `Source` into `Copy` so that `Copy` is the",
      "**transpose** of `Source`:",
      "",
      "`Copy[Column, Row] <- Source[Row, Column]`",
      "",
      "Your code must not output anything."
    ].join("\n"),
    model: `DECLARE Row : INTEGER
DECLARE Column : INTEGER
FOR Row <- 1 TO 3
    FOR Column <- 1 TO 4
        Copy[Column, Row] <- Source[Row, Column]
    NEXT Column
NEXT Row`,
    cases: [
      {
        label: "1 to 12",
        setup: gridSetup("Source", [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])
          + declareGrid("Copy", 4, 3),
        after: printGridAfter("Copy", 4, 3),
      },
      {
        label: "odd then even",
        setup: gridSetup("Source", [[2, 4, 6, 8], [1, 3, 5, 7], [9, 11, 13, 15]])
          + declareGrid("Copy", 4, 3),
        after: printGridAfter("Copy", 4, 3),
      },
      {
        label: "tens",
        setup: gridSetup("Source", [[10, 20, 30, 40], [50, 60, 70, 80], [90, 100, 110, 120]])
          + declareGrid("Copy", 4, 3),
        after: printGridAfter("Copy", 4, 3),
      },
    ],
  },

  {
    id: "orig-2d-largest-cell",
    title: "Largest reading and its cell",
    source: "原创 · §10.2 二维数组",
    marks: 8,
    difficulty: 2,
    chapter: "Ch10 Data types and structures",
    requirement: "Store the largest value in Largest and its row and column in LargeRow and LargeCol",
    prompt: [
      "Temperature readings for 3 zones (rows) and 4 sensors (columns) are stored in the 2D",
      "integer array `Heat`, declared as `ARRAY[1:3, 1:4] OF INTEGER`.",
      "",
      "The largest value is unique. Write pseudocode to store:",
      "- the largest value in `Largest`",
      "- its row in `LargeRow`",
      "- its column in `LargeCol`.",
      "",
      "Your code must not output anything."
    ].join("\n"),
    model: `DECLARE Largest : INTEGER
DECLARE LargeRow : INTEGER
DECLARE LargeCol : INTEGER
DECLARE Row : INTEGER
DECLARE Column : INTEGER
Largest <- Heat[1, 1]
LargeRow <- 1
LargeCol <- 1
FOR Row <- 1 TO 3
    FOR Column <- 1 TO 4
        IF Heat[Row, Column] > Largest THEN
            Largest <- Heat[Row, Column]
            LargeRow <- Row
            LargeCol <- Column
        ENDIF
    NEXT Column
NEXT Row`,
    cases: [
      {
        label: "peak in row 2",
        setup: gridSetup("Heat", [[4, 9, 2, 7], [8, 3, 12, 5], [6, 11, 1, 10]]),
        after: `OUTPUT "${MARK}"
OUTPUT Largest
OUTPUT LargeRow
OUTPUT LargeCol`,
      },
      {
        label: "peak 25",
        setup: gridSetup("Heat", [[21, 14, 18, 9], [7, 25, 13, 16], [11, 8, 19, 22]]),
        after: `OUTPUT "${MARK}"
OUTPUT Largest
OUTPUT LargeRow
OUTPUT LargeCol`,
      },
      {
        label: "one peak",
        setup: gridSetup("Heat", [[5, 5, 5, 5], [5, 9, 5, 5], [5, 5, 5, 5]]),
        after: `OUTPUT "${MARK}"
OUTPUT Largest
OUTPUT LargeRow
OUTPUT LargeCol`,
      },
    ],
  },

  {
    id: "orig-2d-count-value",
    title: "Count a target value in the grid",
    source: "原创 · §10.2 二维数组",
    marks: 8,
    difficulty: 2,
    chapter: "Ch10 Data types and structures",
    requirement: "Count occurrences of Target in Grid and store the count in Count",
    prompt: [
      "A 4 × 4 grid of integers is stored in `Grid`, declared as `ARRAY[1:4, 1:4] OF INTEGER`.",
      "The variable `Target` holds an integer.",
      "",
      "Write pseudocode to count how many times `Target` occurs anywhere in the grid and store",
      "the count in `Count`.",
      "",
      "Your code must not output anything."
    ].join("\n"),
    model: `DECLARE Count : INTEGER
DECLARE Row : INTEGER
DECLARE Column : INTEGER
Count <- 0
FOR Row <- 1 TO 4
    FOR Column <- 1 TO 4
        IF Grid[Row, Column] = Target THEN
            Count <- Count + 1
        ENDIF
    NEXT Column
NEXT Row`,
    cases: [
      {
        label: "target 3",
        setup: gridSetup("Grid", [[3, 1, 4, 1], [5, 9, 2, 6], [5, 3, 5, 8], [9, 7, 9, 3]])
          + "DECLARE Target : INTEGER\nTarget <- 3",
        after: `OUTPUT "${MARK}"
OUTPUT Count`,
      },
      {
        label: "target 7",
        setup: gridSetup("Grid", [[7, 7, 1, 2], [3, 4, 7, 5], [6, 7, 8, 9], [1, 2, 3, 7]])
          + "DECLARE Target : INTEGER\nTarget <- 7",
        after: `OUTPUT "${MARK}"
OUTPUT Count`,
      },
      {
        label: "target 0",
        setup: gridSetup("Grid", [[1, 2, 3, 4], [5, 6, 7, 8], [9, 1, 2, 3], [4, 5, 6, 7]])
          + "DECLARE Target : INTEGER\nTarget <- 0",
        after: `OUTPUT "${MARK}"
OUTPUT Count`,
      },
      {
        label: "target 5",
        setup: gridSetup("Grid", [[5, 1, 5, 2], [3, 5, 5, 4], [6, 5, 7, 8], [5, 9, 1, 5]])
          + "DECLARE Target : INTEGER\nTarget <- 5",
        after: `OUTPUT "${MARK}"
OUTPUT Count`,
      },
    ],
  },

  {
    id: "orig-2d-update-cell",
    title: "Reduce one bin's stock level",
    source: "原创 · §10.2 二维数组",
    marks: 7,
    difficulty: 2,
    chapter: "Ch10 Data types and structures",
    requirement: "Reduce Bin[2, 4] by Amount, never below zero",
    prompt: [
      "Stock levels for 3 aisles (rows) and 5 shelves (columns) are stored in the 2D integer array",
      "`Bin`, declared as `ARRAY[1:3, 1:5] OF INTEGER`.",
      "",
      "`Amount` holds the number of units sold from the bin at row 2, column 4.",
      "",
      "Write pseudocode to reduce `Bin[2, 4]` by `Amount`. If this would make the value negative,",
      "store 0 instead.",
      "",
      "Your code must not output anything; row 2 is printed after your code runs."
    ].join("\n"),
    model: `DECLARE NewQuantity : INTEGER
NewQuantity <- Bin[2, 4] - Amount
IF NewQuantity < 0 THEN
    NewQuantity <- 0
ENDIF
Bin[2, 4] <- NewQuantity`,
    cases: [
      {
        label: "sell 5 from 18",
        setup: gridSetup("Bin", [[8, 12, 6, 10, 4], [14, 9, 22, 18, 11], [5, 7, 9, 3, 6]])
          + "DECLARE Amount : INTEGER\nAmount <- 5",
        after: `OUTPUT "${MARK}"
OUTPUT Bin[2, 1], " ", Bin[2, 2], " ", Bin[2, 3], " ", Bin[2, 4], " ", Bin[2, 5]`,
      },
      {
        label: "sell 6 from 4",
        setup: gridSetup("Bin", [[8, 12, 6, 10, 4], [3, 8, 1, 4, 7], [5, 7, 9, 3, 6]])
          + "DECLARE Amount : INTEGER\nAmount <- 6",
        after: `OUTPUT "${MARK}"
OUTPUT Bin[2, 1], " ", Bin[2, 2], " ", Bin[2, 3], " ", Bin[2, 4], " ", Bin[2, 5]`,
      },
      {
        label: "sell none",
        setup: gridSetup("Bin", [[8, 12, 6, 10, 4], [2, 5, 0, 1, 9], [5, 7, 9, 3, 6]])
          + "DECLARE Amount : INTEGER\nAmount <- 0",
        after: `OUTPUT "${MARK}"
OUTPUT Bin[2, 1], " ", Bin[2, 2], " ", Bin[2, 3], " ", Bin[2, 4], " ", Bin[2, 5]`,
      },
    ],
  },

  {
    id: "orig-2d-border-sum",
    title: "Total of the border cells",
    source: "原创 · §10.2 二维数组",
    marks: 9,
    difficulty: 2,
    chapter: "Ch10 Data types and structures",
    requirement: "Add the border of Frame, counting each corner once, and store it in Border",
    prompt: [
      "A 4 × 4 grid is stored in `Frame`, declared as `ARRAY[1:4, 1:4] OF INTEGER`.",
      "",
      "Write pseudocode to add the values on the **border** of the grid — the first row, the last",
      "row, the first column and the last column — and store the total in `Border`.",
      "",
      "Each corner cell must be counted once only.",
      "",
      "Your code must not output anything."
    ].join("\n"),
    model: `DECLARE Border : INTEGER
DECLARE Row : INTEGER
DECLARE Column : INTEGER
Border <- 0
FOR Row <- 1 TO 4
    FOR Column <- 1 TO 4
        IF Row = 1 OR Row = 4 OR Column = 1 OR Column = 4 THEN
            Border <- Border + Frame[Row, Column]
        ENDIF
    NEXT Column
NEXT Row`,
    cases: [
      {
        label: "1 to 16",
        setup: gridSetup("Frame", [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]),
        after: `OUTPUT "${MARK}"
OUTPUT Border`,
      },
      {
        label: "all threes",
        setup: gridSetup("Frame", [[3, 3, 3, 3], [3, 3, 3, 3], [3, 3, 3, 3], [3, 3, 3, 3]]),
        after: `OUTPUT "${MARK}"
OUTPUT Border`,
      },
      {
        label: "mixed border",
        setup: gridSetup("Frame", [[2, 4, 6, 8], [1, 3, 5, 7], [9, 11, 13, 15], [10, 12, 14, 16]]),
        after: `OUTPUT "${MARK}"
OUTPUT Border`,
      },
    ],
  },

  // ------------------------------------------------------- arrays as parameters
  {
    id: "orig-param-byref-scale",
    title: "Scale an array through a BYREF parameter",
    source: "原创 · §9.2 数组参数",
    marks: 11,
    difficulty: 3,
    chapter: "Ch09 Algorithm design",
    requirement: "PROCEDURE Scale(BYREF Values : ARRAY[1:6] OF INTEGER, BYVAL Factor : INTEGER)",
    prompt: [
      "A procedure `Scale` will multiply the positive values in an array by a factor.",
      "",
      "```",
      "PROCEDURE Scale(BYREF Values : ARRAY[1:6] OF INTEGER, BYVAL Factor : INTEGER)",
      "```",
      "",
      "The procedure must:",
      "- multiply every element that is 0 or greater by `Factor`",
      "- leave any negative element unchanged",
      "- change the array in the caller, but not change `Factor`",
      "- produce no output.",
      "",
      "Write pseudocode for `Scale`."
    ].join("\n"),
    model: `PROCEDURE Scale(BYREF Values : ARRAY[1:6] OF INTEGER, BYVAL Factor : INTEGER)
    DECLARE Index : INTEGER
    FOR Index <- 1 TO 6
        IF Values[Index] >= 0 THEN
            Values[Index] <- Values[Index] * Factor
        ENDIF
    NEXT Index
ENDPROCEDURE`,
    cases: [
      {
        label: "factor 3, two negatives",
        setup: listSetup("Values", [2, -4, 6, -8, 10, 12]) + "DECLARE Factor : INTEGER\nFactor <- 3",
        after: `OUTPUT "${MARK}"
CALL Scale(Values, Factor)
DECLARE PrintIndex : INTEGER
FOR PrintIndex <- 1 TO 6
    OUTPUT Values[PrintIndex]
NEXT PrintIndex`,
      },
      {
        label: "factor 1, unchanged",
        setup: listSetup("Values", [5, 0, 7, 1, 9, 4]) + "DECLARE Factor : INTEGER\nFactor <- 1",
        after: `OUTPUT "${MARK}"
CALL Scale(Values, Factor)
DECLARE PrintIndex : INTEGER
FOR PrintIndex <- 1 TO 6
    OUTPUT Values[PrintIndex]
NEXT PrintIndex`,
      },
      {
        label: "factor 2, alternating signs",
        setup: listSetup("Values", [-2, 4, -6, 8, 10, -12]) + "DECLARE Factor : INTEGER\nFactor <- 2",
        after: `OUTPUT "${MARK}"
CALL Scale(Values, Factor)
DECLARE PrintIndex : INTEGER
FOR PrintIndex <- 1 TO 6
    OUTPUT Values[PrintIndex]
NEXT PrintIndex`,
      },
    ],
  },

  {
    id: "orig-param-byvalue-mean",
    title: "Count values above the mean",
    source: "原创 · §9.2 数组参数",
    marks: 11,
    difficulty: 3,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION AboveMean(Data : ARRAY[1:6] OF INTEGER) RETURNS INTEGER",
    prompt: [
      "A function `AboveMean` takes an array by value and counts how many of its values are",
      "greater than the mean of the array.",
      "",
      "```",
      "FUNCTION AboveMean(Data : ARRAY[1:6] OF INTEGER) RETURNS INTEGER",
      "```",
      "",
      "The function must:",
      "- calculate the mean of the six values",
      "- return the number of values **strictly greater than** that mean",
      "- not change the array in the caller.",
      "",
      "Write pseudocode for `AboveMean`. The caller's array is printed after the call to show that",
      "it is unchanged."
    ].join("\n"),
    model: `FUNCTION AboveMean(Data : ARRAY[1:6] OF INTEGER) RETURNS INTEGER
    DECLARE Total : INTEGER
    DECLARE Mean : REAL
    DECLARE Count : INTEGER
    DECLARE Index : INTEGER
    Total <- 0
    FOR Index <- 1 TO 6
        Total <- Total + Data[Index]
    NEXT Index
    Mean <- Total / 6
    Count <- 0
    FOR Index <- 1 TO 6
        IF Data[Index] > Mean THEN
            Count <- Count + 1
        ENDIF
    NEXT Index
    RETURN Count
ENDFUNCTION`,
    cases: [
      {
        label: "4 8 6 10 2 12",
        setup: listSetup("Data", [4, 8, 6, 10, 2, 12]),
        after: `OUTPUT "${MARK}"
OUTPUT AboveMean(Data)
DECLARE PrintIndex : INTEGER
FOR PrintIndex <- 1 TO 6
    OUTPUT Data[PrintIndex]
NEXT PrintIndex`,
      },
      {
        label: "all fives",
        setup: listSetup("Data", [5, 5, 5, 5, 5, 5]),
        after: `OUTPUT "${MARK}"
OUTPUT AboveMean(Data)
DECLARE PrintIndex : INTEGER
FOR PrintIndex <- 1 TO 6
    OUTPUT Data[PrintIndex]
NEXT PrintIndex`,
      },
      {
        label: "one outlier",
        setup: listSetup("Data", [1, 2, 3, 4, 5, 21]),
        after: `OUTPUT "${MARK}"
OUTPUT AboveMean(Data)
DECLARE PrintIndex : INTEGER
FOR PrintIndex <- 1 TO 6
    OUTPUT Data[PrintIndex]
NEXT PrintIndex`,
      },
      {
        label: "9 3 7 5 11 1",
        setup: listSetup("Data", [9, 3, 7, 5, 11, 1]),
        after: `OUTPUT "${MARK}"
OUTPUT AboveMean(Data)
DECLARE PrintIndex : INTEGER
FOR PrintIndex <- 1 TO 6
    OUTPUT Data[PrintIndex]
NEXT PrintIndex`,
      },
    ],
  },

  {
    id: "orig-param-fill",
    title: "Fill a grid passed to a procedure",
    source: "原创 · §9.2 数组参数",
    marks: 9,
    difficulty: 2,
    chapter: "Ch09 Algorithm design",
    requirement: "PROCEDURE FillGrid(BYREF Grid : ARRAY[1:3, 1:3] OF INTEGER, BYVAL Start : INTEGER)",
    prompt: [
      "A procedure `FillGrid` will fill a 3 × 3 grid with consecutive integers.",
      "",
      "```",
      "PROCEDURE FillGrid(BYREF Grid : ARRAY[1:3, 1:3] OF INTEGER, BYVAL Start : INTEGER)",
      "```",
      "",
      "The procedure must:",
      "- fill every cell so that `Grid[Row, Column] <- Start + (Row - 1) * 3 + (Column - 1)`",
      "- change the grid in the caller, but not change `Start`",
      "- produce no output.",
      "",
      "Write pseudocode for `FillGrid`."
    ].join("\n"),
    model: `PROCEDURE FillGrid(BYREF Grid : ARRAY[1:3, 1:3] OF INTEGER, BYVAL Start : INTEGER)
    DECLARE Row : INTEGER
    DECLARE Column : INTEGER
    FOR Row <- 1 TO 3
        FOR Column <- 1 TO 3
            Grid[Row, Column] <- Start + (Row - 1) * 3 + (Column - 1)
        NEXT Column
    NEXT Row
ENDPROCEDURE`,
    cases: [
      {
        label: "start 1",
        setup: declareGrid("Grid", 3, 3) + "DECLARE Start : INTEGER\nStart <- 1",
        after: `OUTPUT "${MARK}"
CALL FillGrid(Grid, Start)
DECLARE PrintRow : INTEGER
FOR PrintRow <- 1 TO 3
    OUTPUT Grid[PrintRow, 1], " ", Grid[PrintRow, 2], " ", Grid[PrintRow, 3]
NEXT PrintRow`,
      },
      {
        label: "start 10",
        setup: declareGrid("Grid", 3, 3) + "DECLARE Start : INTEGER\nStart <- 10",
        after: `OUTPUT "${MARK}"
CALL FillGrid(Grid, Start)
DECLARE PrintRow : INTEGER
FOR PrintRow <- 1 TO 3
    OUTPUT Grid[PrintRow, 1], " ", Grid[PrintRow, 2], " ", Grid[PrintRow, 3]
NEXT PrintRow`,
      },
      {
        label: "start 0",
        setup: declareGrid("Grid", 3, 3) + "DECLARE Start : INTEGER\nStart <- 0",
        after: `OUTPUT "${MARK}"
CALL FillGrid(Grid, Start)
DECLARE PrintRow : INTEGER
FOR PrintRow <- 1 TO 3
    OUTPUT Grid[PrintRow, 1], " ", Grid[PrintRow, 2], " ", Grid[PrintRow, 3]
NEXT PrintRow`,
      },
    ],
  },

  {
    id: "orig-param-2d-stat",
    title: "Count rows that reach a target",
    source: "原创 · §9.2 数组参数",
    marks: 11,
    difficulty: 3,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION FullRows(Sales : ARRAY[1:4, 1:3] OF INTEGER, Target : INTEGER) RETURNS INTEGER",
    prompt: [
      "A function `FullRows` examines a grid of sales figures and returns how many rows have a",
      "total that reaches a target.",
      "",
      "```",
      "FUNCTION FullRows(Sales : ARRAY[1:4, 1:3] OF INTEGER, Target : INTEGER) RETURNS INTEGER",
      "```",
      "",
      "The function must:",
      "- total each of the four rows",
      "- return the number of rows whose total is **greater than or equal to** `Target`",
      "- not change the grid or `Target`.",
      "",
      "Write pseudocode for `FullRows`."
    ].join("\n"),
    model: `FUNCTION FullRows(Sales : ARRAY[1:4, 1:3] OF INTEGER, Target : INTEGER) RETURNS INTEGER
    DECLARE Row : INTEGER
    DECLARE Column : INTEGER
    DECLARE RowSum : INTEGER
    DECLARE Count : INTEGER
    Count <- 0
    FOR Row <- 1 TO 4
        RowSum <- 0
        FOR Column <- 1 TO 3
            RowSum <- RowSum + Sales[Row, Column]
        NEXT Column
        IF RowSum >= Target THEN
            Count <- Count + 1
        ENDIF
    NEXT Row
    RETURN Count
ENDFUNCTION`,
    cases: [
      {
        label: "target 60",
        setup: gridSetup("Sales", [[10, 20, 30], [5, 5, 5], [40, 10, 20], [25, 25, 25]])
          + "DECLARE Target : INTEGER\nTarget <- 60",
        after: `OUTPUT "${MARK}"
OUTPUT FullRows(Sales, Target)`,
      },
      {
        label: "empty grid, target 1",
        setup: gridSetup("Sales", [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]])
          + "DECLARE Target : INTEGER\nTarget <- 1",
        after: `OUTPUT "${MARK}"
OUTPUT FullRows(Sales, Target)`,
      },
      {
        label: "target 100",
        setup: gridSetup("Sales", [[100, 50, 25], [20, 20, 20], [5, 90, 5], [30, 30, 30]])
          + "DECLARE Target : INTEGER\nTarget <- 100",
        after: `OUTPUT "${MARK}"
OUTPUT FullRows(Sales, Target)`,
      },
      {
        label: "target 0",
        setup: gridSetup("Sales", [[10, 10, 10], [20, 20, 20], [5, 5, 5], [30, 30, 30]])
          + "DECLARE Target : INTEGER\nTarget <- 0",
        after: `OUTPUT "${MARK}"
OUTPUT FullRows(Sales, Target)`,
      },
    ],
  },
];
