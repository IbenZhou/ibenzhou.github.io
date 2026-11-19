// Original questions written for this bank, grouped by topic.
export const BASICS = [
  {
    id: "ob-var-assign-chain",
    title: "BookingCost() — chained assignments",
    source: "原创 · §11.1 赋值",
    marks: 5,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION BookingCost(Guests : INTEGER, Nights : INTEGER) RETURNS INTEGER",
    prompt: [
      "A guest house has rooms that each sleep at most two guests. A room costs $45",
      "per night and every booking also has a one-off service charge of $20.",
      "",
      "A function `BookingCost()` takes the number of guests and the number of nights.",
      "It returns the total cost of the booking in whole dollars.",
      "",
      "Write pseudocode for `BookingCost()`. Calculate the number of rooms needed, then",
      "the number of room-nights, then the room cost, then the total, so that each value",
      "is built from the value before it."
    ].join("\n"),
    model: `FUNCTION BookingCost(Guests : INTEGER, Nights : INTEGER) RETURNS INTEGER
    DECLARE Rooms : INTEGER
    DECLARE RoomNights : INTEGER
    DECLARE RoomCost : INTEGER
    DECLARE Service : INTEGER
    DECLARE Total : INTEGER
    Rooms <- (Guests + 1) DIV 2
    RoomNights <- Rooms * Nights
    RoomCost <- RoomNights * 45
    Service <- 20
    Total <- RoomCost + Service
    RETURN Total
ENDFUNCTION`,
    after: `OUTPUT BookingCost(2, 3)`,
    cases: [
      { label: "2 guests, 3 nights", after: "OUTPUT BookingCost(2, 3)" },
      { label: "1 guest, 1 night", after: "OUTPUT BookingCost(1, 1)" },
      { label: "5 guests, 4 nights", after: "OUTPUT BookingCost(5, 4)" },
      { label: "6 guests, 7 nights", after: "OUTPUT BookingCost(6, 7)" },
    ],
  },

  {
    id: "ob-var-real-div",
    title: "SplitBill() — REAL division and DIV",
    source: "原创 · §11.1 实数除法",
    marks: 4,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "PROCEDURE SplitBill(Total : REAL, People : INTEGER)",
    prompt: [
      "A group of friends shares a restaurant bill equally.",
      "",
      "A procedure `SplitBill()` takes the total bill as a `REAL` and the number of",
      "people as an `INTEGER`. It outputs two values, each on its own line:",
      "- the exact amount each person pays, calculated with `/` so that the result is a `REAL`",
      "- the number of whole dollars each person pays, calculated with `DIV` on the",
      "  whole-dollar part of the bill",
      "",
      "Use `INT()` to obtain the whole-dollar part of the bill.",
      "",
      "Write pseudocode for `SplitBill()`."
    ].join("\n"),
    model: `PROCEDURE SplitBill(Total : REAL, People : INTEGER)
    DECLARE EachShare : REAL
    DECLARE WholeShare : INTEGER
    EachShare <- Total / People
    WholeShare <- INT(Total) DIV People
    OUTPUT EachShare
    OUTPUT WholeShare
ENDPROCEDURE`,
    after: `CALL SplitBill(84.0, 4)`,
    cases: [
      { label: "bill 84.0, 4 people", after: "CALL SplitBill(84.0, 4)" },
      { label: "bill 90.0, 4 people", after: "CALL SplitBill(90.0, 4)" },
      { label: "bill 75.5, 5 people", after: "CALL SplitBill(75.5, 5)" },
      { label: "bill 100.0, 8 people", after: "CALL SplitBill(100.0, 8)" },
    ],
  },

  {
    id: "ob-var-div-mod",
    title: "PackBoxes() — full boxes and leftovers",
    source: "原创 · §11.1 DIV 与 MOD",
    marks: 4,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION PackBoxes(Sweets : INTEGER, BoxSize : INTEGER) RETURNS STRING",
    prompt: [
      "Sweets are packed into boxes that each hold the same number of sweets. The last",
      "box may be partly filled.",
      "",
      "A function `PackBoxes()` takes the number of sweets and the box size. It returns",
      "a string in exactly this format:",
      "`<number of full boxes> full boxes, <number of sweets left over> left over`",
      "",
      "For example, `PackBoxes(38, 5)` returns `\"7 full boxes, 3 left over\"`.",
      "",
      "Write pseudocode for `PackBoxes()`."
    ].join("\n"),
    model: `FUNCTION PackBoxes(Sweets : INTEGER, BoxSize : INTEGER) RETURNS STRING
    DECLARE FullBoxes : INTEGER
    DECLARE Loose : INTEGER
    FullBoxes <- Sweets DIV BoxSize
    Loose <- Sweets MOD BoxSize
    RETURN NUM_TO_STR(FullBoxes) & " full boxes, " & NUM_TO_STR(Loose) & " left over"
ENDFUNCTION`,
    after: `OUTPUT PackBoxes(38, 5)`,
    cases: [
      { label: "38 sweets, boxes of 5", after: "OUTPUT PackBoxes(38, 5)" },
      { label: "20 sweets, boxes of 4", after: "OUTPUT PackBoxes(20, 4)" },
      { label: "3 sweets, boxes of 6", after: "OUTPUT PackBoxes(3, 6)" },
      { label: "101 sweets, boxes of 10", after: "OUTPUT PackBoxes(101, 10)" },
    ],
  },

  {
    id: "ob-var-concat",
    title: "MemberCode() — join strings with &",
    source: "原创 · §11.1 字符串连接",
    marks: 5,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION MemberCode(Surname : STRING, Year : INTEGER, Number : INTEGER) RETURNS STRING",
    prompt: [
      "A gym gives each member a code made from:",
      "- the first character of the surname, changed to upper case",
      "- a hyphen",
      "- the year the member joined",
      "- a hyphen",
      "- the membership number",
      "",
      "For example, `\"patel\"`, joining in 2024 with number 17, gives `\"P-2024-17\"`.",
      "",
      "A function `MemberCode()` takes the surname, the year and the membership number.",
      "It returns the code.",
      "",
      "Write pseudocode for `MemberCode()`. Use the concatenation operator `&` and the",
      "function `TO_UPPER()`."
    ].join("\n"),
    model: `FUNCTION MemberCode(Surname : STRING, Year : INTEGER, Number : INTEGER) RETURNS STRING
    DECLARE Code : STRING
    Code <- TO_UPPER(LEFT(Surname, 1))
    Code <- Code & "-" & NUM_TO_STR(Year)
    Code <- Code & "-" & NUM_TO_STR(Number)
    RETURN Code
ENDFUNCTION`,
    after: `OUTPUT MemberCode("patel", 2024, 17)`,
    cases: [
      { label: '"patel", 2024, 17', after: 'OUTPUT MemberCode("patel", 2024, 17)' },
      { label: '"Ng", 2023, 5', after: 'OUTPUT MemberCode("Ng", 2023, 5)' },
      { label: '"okafor", 2026, 104', after: 'OUTPUT MemberCode("okafor", 2026, 104)' },
    ],
  },

  {
    id: "ob-var-boolean",
    title: "CanEnter() — combine conditions",
    source: "原创 · §11.1 布尔运算",
    marks: 4,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION CanEnter(Age : INTEGER, HasTicket : BOOLEAN, IsBanned : BOOLEAN) RETURNS BOOLEAN",
    prompt: [
      "A club admits a person only when both of these are true:",
      "- the person is not banned",
      "- the person is 18 or older, or the person holds a ticket",
      "",
      "A function `CanEnter()` takes the age, whether the person holds a ticket, and",
      "whether the person is banned. It returns `TRUE` if the person can enter,",
      "otherwise `FALSE`.",
      "",
      "Write pseudocode for `CanEnter()`. Use one `RETURN` statement that combines the",
      "three conditions with `AND`, `OR` and `NOT`."
    ].join("\n"),
    model: `FUNCTION CanEnter(Age : INTEGER, HasTicket : BOOLEAN, IsBanned : BOOLEAN) RETURNS BOOLEAN
    RETURN NOT IsBanned AND (Age >= 18 OR HasTicket = TRUE)
ENDFUNCTION`,
    after: `OUTPUT CanEnter(20, FALSE, FALSE)`,
    cases: [
      { label: "20, no ticket, not banned", after: "OUTPUT CanEnter(20, FALSE, FALSE)" },
      { label: "16, ticket, not banned", after: "OUTPUT CanEnter(16, TRUE, FALSE)" },
      { label: "16, no ticket, not banned", after: "OUTPUT CanEnter(16, FALSE, FALSE)" },
      { label: "30, ticket, banned", after: "OUTPUT CanEnter(30, TRUE, TRUE)" },
    ],
  },

  {
    id: "ob-var-swap",
    title: "SwapValues() — swap two values",
    source: "原创 · §11.1 交换变量",
    marks: 4,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "PROCEDURE SwapValues(BYREF First : INTEGER, BYREF Second : INTEGER)",
    prompt: [
      "A program stores two whole numbers in the variables `A` and `B`.",
      "",
      "A procedure `SwapValues()` takes the two values and swaps them, so that after",
      "the call the first variable holds the original value of the second and the",
      "second variable holds the original value of the first.",
      "",
      "Write pseudocode for `SwapValues()`. The calling program must see both new",
      "values, so declare the parameters using `BYREF`."
    ].join("\n"),
    model: `PROCEDURE SwapValues(BYREF First : INTEGER, BYREF Second : INTEGER)
    DECLARE Temp : INTEGER
    Temp <- First
    First <- Second
    Second <- Temp
ENDPROCEDURE`,
    after: `DECLARE A : INTEGER
DECLARE B : INTEGER
A <- 3
B <- 8
CALL SwapValues(A, B)
OUTPUT A, " ", B`,
    cases: [
      {
        label: "3 and 8",
        after: "DECLARE A : INTEGER\nDECLARE B : INTEGER\nA <- 3\nB <- 8\nCALL SwapValues(A, B)\nOUTPUT A, \" \", B",
      },
      {
        label: "-4 and 0",
        after: "DECLARE A : INTEGER\nDECLARE B : INTEGER\nA <- -4\nB <- 0\nCALL SwapValues(A, B)\nOUTPUT A, \" \", B",
      },
      {
        label: "99 and 100",
        after: "DECLARE A : INTEGER\nDECLARE B : INTEGER\nA <- 99\nB <- 100\nCALL SwapValues(A, B)\nOUTPUT A, \" \", B",
      },
    ],
  },

  {
    id: "ob-sel-nested-if",
    title: "BaggageCharge() — nested IF",
    source: "原创 · §11.2 嵌套 IF",
    marks: 6,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION BaggageCharge(Weight : INTEGER) RETURNS INTEGER",
    prompt: [
      "An airline allows 23 kg of baggage free of charge.",
      "- A bag heavier than 23 kg, but not more than 32 kg, costs $8 for each whole",
      "  kilogram over 23.",
      "- A bag heavier than 32 kg costs a flat $90.",
      "",
      "A function `BaggageCharge()` takes the weight of a bag in whole kilograms and",
      "returns the charge in whole dollars.",
      "",
      "Write pseudocode for `BaggageCharge()` using nested `IF` statements."
    ].join("\n"),
    model: `FUNCTION BaggageCharge(Weight : INTEGER) RETURNS INTEGER
    DECLARE Charge : INTEGER
    IF Weight <= 23 THEN
        Charge <- 0
    ELSE
        IF Weight <= 32 THEN
            Charge <- (Weight - 23) * 8
        ELSE
            Charge <- 90
        ENDIF
    ENDIF
    RETURN Charge
ENDFUNCTION`,
    after: `OUTPUT BaggageCharge(18)`,
    cases: [
      { label: "18 kg", after: "OUTPUT BaggageCharge(18)" },
      { label: "26 kg", after: "OUTPUT BaggageCharge(26)" },
      { label: "32 kg", after: "OUTPUT BaggageCharge(32)" },
      { label: "40 kg", after: "OUTPUT BaggageCharge(40)" },
    ],
  },

  {
    id: "ob-sel-else-chain",
    title: "GradeLetter() — IF chain",
    source: "原创 · §11.2 IF 链",
    marks: 6,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION GradeLetter(Mark : INTEGER) RETURNS STRING",
    prompt: [
      "An exam paper is marked out of 100. The grades are:",
      "- `\"A\"` for 80 or more",
      "- `\"B\"` for 70 to 79",
      "- `\"C\"` for 60 to 69",
      "- `\"D\"` for 50 to 59",
      "- `\"U\"` for less than 50",
      "",
      "A function `GradeLetter()` takes a mark and returns the grade as a string.",
      "",
      "Write pseudocode for `GradeLetter()` using a chain of `IF` statements, with a",
      "further `IF` inside each `ELSE`. The mark is always from 0 to 100."
    ].join("\n"),
    model: `FUNCTION GradeLetter(Mark : INTEGER) RETURNS STRING
    DECLARE Grade : STRING
    IF Mark >= 80 THEN
        Grade <- "A"
    ELSE
        IF Mark >= 70 THEN
            Grade <- "B"
        ELSE
            IF Mark >= 60 THEN
                Grade <- "C"
            ELSE
                IF Mark >= 50 THEN
                    Grade <- "D"
                ELSE
                    Grade <- "U"
                ENDIF
            ENDIF
        ENDIF
    ENDIF
    RETURN Grade
ENDFUNCTION`,
    after: `OUTPUT GradeLetter(91)`,
    cases: [
      { label: "mark 91", after: "OUTPUT GradeLetter(91)" },
      { label: "mark 74", after: "OUTPUT GradeLetter(74)" },
      { label: "mark 60", after: "OUTPUT GradeLetter(60)" },
      { label: "mark 49", after: "OUTPUT GradeLetter(49)" },
    ],
  },

  {
    id: "ob-sel-case-values",
    title: "SeatPrice() — CASE with single values",
    source: "原创 · §11.2 CASE 单值",
    marks: 5,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION SeatPrice(SeatClass : CHAR) RETURNS INTEGER",
    prompt: [
      "A cinema charges:",
      "- $120 for a first-class seat, code `'F'`",
      "- $75 for a business-class seat, code `'B'`",
      "- $40 for an economy seat, code `'E'`",
      "",
      "A function `SeatPrice()` takes the seat class as a single character and returns",
      "the price.",
      "",
      "Write pseudocode for `SeatPrice()` using `CASE OF` with one single-value label",
      "for each class. Assume the character is always one of the three."
    ].join("\n"),
    model: `FUNCTION SeatPrice(SeatClass : CHAR) RETURNS INTEGER
    DECLARE Price : INTEGER
    CASE OF SeatClass
        'F' : Price <- 120
        'B' : Price <- 75
        'E' : Price <- 40
    ENDCASE
    RETURN Price
ENDFUNCTION`,
    after: `OUTPUT SeatPrice('F')`,
    cases: [
      { label: "first class 'F'", after: "OUTPUT SeatPrice('F')" },
      { label: "business class 'B'", after: "OUTPUT SeatPrice('B')" },
      { label: "economy 'E'", after: "OUTPUT SeatPrice('E')" },
    ],
  },

  {
    id: "ob-sel-case-ranges",
    title: "AgeBand() — CASE with ranges",
    source: "原创 · §11.2 CASE 范围",
    marks: 6,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION AgeBand(Age : INTEGER) RETURNS STRING",
    prompt: [
      "A survey groups people by age:",
      "- 0 to 12 inclusive: `\"Child\"`",
      "- 13 to 19 inclusive: `\"Teenager\"`",
      "- 20 to 64 inclusive: `\"Adult\"`",
      "- 65 to 120 inclusive: `\"Senior\"`",
      "",
      "A function `AgeBand()` takes an age and returns the band as a string.",
      "",
      "Write pseudocode for `AgeBand()` using `CASE OF` with a range label for each",
      "band. The age is always from 0 to 120."
    ].join("\n"),
    model: `FUNCTION AgeBand(Age : INTEGER) RETURNS STRING
    DECLARE Band : STRING
    CASE OF Age
        0 TO 12 : Band <- "Child"
        13 TO 19 : Band <- "Teenager"
        20 TO 64 : Band <- "Adult"
        65 TO 120 : Band <- "Senior"
    ENDCASE
    RETURN Band
ENDFUNCTION`,
    after: `OUTPUT AgeBand(8)`,
    cases: [
      { label: "age 8", after: "OUTPUT AgeBand(8)" },
      { label: "age 13", after: "OUTPUT AgeBand(13)" },
      { label: "age 47", after: "OUTPUT AgeBand(47)" },
      { label: "age 70", after: "OUTPUT AgeBand(70)" },
    ],
  },

  {
    id: "ob-sel-case-otherwise",
    title: "MenuChoice() — CASE with OTHERWISE",
    source: "原创 · §11.2 CASE OTHERWISE",
    marks: 5,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "PROCEDURE MenuChoice(Choice : INTEGER)",
    prompt: [
      "A bank machine menu has three options:",
      "1. `\"Open new account\"`",
      "2. `\"Close account\"`",
      "3. `\"Print statement\"`",
      "",
      "A procedure `MenuChoice()` takes the chosen option number and outputs the",
      "matching text on its own line. Any other number outputs `\"Invalid choice\"`.",
      "",
      "Write pseudocode for `MenuChoice()` using `CASE OF` with an `OTHERWISE` branch."
    ].join("\n"),
    model: `PROCEDURE MenuChoice(Choice : INTEGER)
    CASE OF Choice
        1 : OUTPUT "Open new account"
        2 : OUTPUT "Close account"
        3 : OUTPUT "Print statement"
        OTHERWISE : OUTPUT "Invalid choice"
    ENDCASE
ENDPROCEDURE`,
    after: `CALL MenuChoice(1)`,
    cases: [
      { label: "choice 1", after: "CALL MenuChoice(1)" },
      { label: "choice 2", after: "CALL MenuChoice(2)" },
      { label: "choice 3", after: "CALL MenuChoice(3)" },
      { label: "choice 4", after: "CALL MenuChoice(4)" },
    ],
  },

  {
    id: "ob-sel-guard",
    title: "Withdraw() — reject a bad request",
    source: "原创 · §11.2 输入校验",
    marks: 6,
    difficulty: 1,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION Withdraw(Amount : INTEGER, Balance : INTEGER) RETURNS INTEGER",
    prompt: [
      "A cash machine dispenses multiples of $10 only. A withdrawal is accepted only",
      "when the amount is more than zero, is no more than the balance, and is a",
      "multiple of $10.",
      "",
      "A function `Withdraw()` takes the amount requested and the current balance. It",
      "returns the new balance if the withdrawal is accepted, or `-1` if it is rejected.",
      "",
      "Write pseudocode for `Withdraw()`. Use one guard `IF` statement at the start",
      "that rejects a bad request, combining the three checks with `OR`."
    ].join("\n"),
    model: `FUNCTION Withdraw(Amount : INTEGER, Balance : INTEGER) RETURNS INTEGER
    IF Amount <= 0 OR Amount > Balance OR Amount MOD 10 <> 0 THEN
        RETURN -1
    ENDIF
    RETURN Balance - Amount
ENDFUNCTION`,
    after: `OUTPUT Withdraw(50, 120)`,
    cases: [
      { label: "withdraw 50 from 120", after: "OUTPUT Withdraw(50, 120)" },
      { label: "withdraw 125 from 120", after: "OUTPUT Withdraw(125, 120)" },
      { label: "withdraw 30 from 20", after: "OUTPUT Withdraw(30, 20)" },
      { label: "withdraw 200 from 450", after: "OUTPUT Withdraw(200, 450)" },
    ],
  },

  {
    id: "ob-loop-for-count",
    title: "PrintTickets() — count with FOR",
    source: "原创 · §11.2 计数循环",
    marks: 4,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "PROCEDURE PrintTickets(FirstNumber : INTEGER, Count : INTEGER)",
    prompt: [
      "A box office prints ticket numbers in order.",
      "",
      "A procedure `PrintTickets()` takes the first ticket number and how many tickets",
      "to print. It outputs each ticket number, in order, on its own line.",
      "",
      "For example, `PrintTickets(101, 3)` outputs:",
      "101",
      "102",
      "103",
      "",
      "Write pseudocode for `PrintTickets()` using a `FOR` loop."
    ].join("\n"),
    model: `PROCEDURE PrintTickets(FirstNumber : INTEGER, Count : INTEGER)
    DECLARE Num : INTEGER
    FOR Num <- FirstNumber TO FirstNumber + Count - 1
        OUTPUT Num
    NEXT Num
ENDPROCEDURE`,
    after: `CALL PrintTickets(101, 3)`,
    cases: [
      { label: "101, 3 tickets", after: "CALL PrintTickets(101, 3)" },
      { label: "1, 5 tickets", after: "CALL PrintTickets(1, 5)" },
      { label: "500, 2 tickets", after: "CALL PrintTickets(500, 2)" },
      { label: "7, 1 ticket", after: "CALL PrintTickets(7, 1)" },
    ],
  },

  {
    id: "ob-loop-for-step",
    title: "CountBy() — FOR with STEP",
    source: "原创 · §11.2 STEP 循环",
    marks: 5,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "PROCEDURE CountBy(Start : INTEGER, Finish : INTEGER, StepSize : INTEGER)",
    prompt: [
      "A procedure `CountBy()` takes a start value, a finish value and a step size.",
      "It outputs every value from the start to the finish inclusive, going up or down",
      "by the step size.",
      "",
      "For example:",
      "- `CountBy(1, 10, 3)` outputs 1, 4, 7, 10",
      "- `CountBy(10, 1, -3)` outputs 10, 7, 4, 1",
      "",
      "The step size is never zero. Each value is output on its own line.",
      "",
      "Write pseudocode for `CountBy()` using a single `FOR` loop with `STEP`."
    ].join("\n"),
    model: `PROCEDURE CountBy(Start : INTEGER, Finish : INTEGER, StepSize : INTEGER)
    DECLARE Num : INTEGER
    FOR Num <- Start TO Finish STEP StepSize
        OUTPUT Num
    NEXT Num
ENDPROCEDURE`,
    after: `CALL CountBy(1, 10, 3)`,
    cases: [
      { label: "1 to 10 step 3", after: "CALL CountBy(1, 10, 3)" },
      { label: "10 to 1 step -3", after: "CALL CountBy(10, 1, -3)" },
      { label: "0 to 4 step 2", after: "CALL CountBy(0, 4, 2)" },
      { label: "5 to 5 step 1", after: "CALL CountBy(5, 5, 1)" },
    ],
  },

  {
    id: "ob-loop-nested-for",
    title: "TimesGrid() — nested FOR",
    source: "原创 · §11.2 嵌套循环",
    marks: 8,
    difficulty: 2,
    chapter: "Ch11 Programming",
    requirement: "PROCEDURE TimesGrid(Rows : INTEGER, Columns : INTEGER)",
    prompt: [
      "A teacher wants a multiplication grid.",
      "",
      "A procedure `TimesGrid()` takes a number of rows and a number of columns. For",
      "each row `R` it outputs one line holding `R × 1`, `R × 2` ... `R × Columns`,",
      "separated by single spaces, with no space after the last value.",
      "",
      "For example, `TimesGrid(2, 3)` outputs:",
      "1 2 3",
      "2 4 6",
      "",
      "Write pseudocode for `TimesGrid()` using nested `FOR` loops."
    ].join("\n"),
    model: `PROCEDURE TimesGrid(Rows : INTEGER, Columns : INTEGER)
    DECLARE R : INTEGER
    DECLARE C : INTEGER
    DECLARE Line : STRING
    FOR R <- 1 TO Rows
        Line <- ""
        FOR C <- 1 TO Columns
            IF C > 1 THEN
                Line <- Line & " "
            ENDIF
            Line <- Line & NUM_TO_STR(R * C)
        NEXT C
        OUTPUT Line
    NEXT R
ENDPROCEDURE`,
    after: `CALL TimesGrid(2, 3)`,
    cases: [
      { label: "2 rows, 3 columns", after: "CALL TimesGrid(2, 3)" },
      { label: "3 rows, 4 columns", after: "CALL TimesGrid(3, 4)" },
      { label: "4 rows, 2 columns", after: "CALL TimesGrid(4, 2)" },
    ],
  },

  {
    id: "ob-loop-accumulator",
    title: "TotalRainfall() — running total",
    source: "原创 · §11.2 累加",
    marks: 6,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "PROCEDURE TotalRainfall(Days : INTEGER)",
    prompt: [
      "A weather station records the rainfall for each day of a period.",
      "",
      "A procedure `TotalRainfall()` takes the number of days. For each day it inputs",
      "the rainfall in whole millimetres and adds it to a running total. At the end it",
      "outputs the total.",
      "",
      "For example, with inputs 12, 0 and 5 for 3 days, the output is 17.",
      "",
      "Write pseudocode for `TotalRainfall()`."
    ].join("\n"),
    model: `PROCEDURE TotalRainfall(Days : INTEGER)
    DECLARE Total : INTEGER
    DECLARE Day : INTEGER
    DECLARE Rainfall : INTEGER
    Total <- 0
    FOR Day <- 1 TO Days
        INPUT Rainfall
        Total <- Total + Rainfall
    NEXT Day
    OUTPUT Total
ENDPROCEDURE`,
    after: `CALL TotalRainfall(3)`,
    cases: [
      { label: "3 days: 12, 0, 5", inputs: ["12", "0", "5"], after: "CALL TotalRainfall(3)" },
      { label: "1 day: 7", inputs: ["7"], after: "CALL TotalRainfall(1)" },
      { label: "5 days: 2, 4, 6, 8, 10", inputs: ["2", "4", "6", "8", "10"], after: "CALL TotalRainfall(5)" },
      { label: "2 dry days", inputs: ["0", "0"], after: "CALL TotalRainfall(2)" },
    ],
  },

  {
    id: "ob-loop-count-matches",
    title: "CountPass() — count marks that pass",
    source: "原创 · §11.2 计数匹配",
    marks: 6,
    difficulty: 1,
    chapter: "Ch09 Algorithm design",
    requirement: "FUNCTION CountPass(Count : INTEGER) RETURNS INTEGER",
    prompt: [
      "A pass mark is 50.",
      "",
      "A function `CountPass()` takes the number of marks to process. It inputs that",
      "many marks and returns how many of them are 50 or more.",
      "",
      "Write pseudocode for `CountPass()`."
    ].join("\n"),
    model: `FUNCTION CountPass(Count : INTEGER) RETURNS INTEGER
    DECLARE Passed : INTEGER
    DECLARE Index : INTEGER
    DECLARE Mark : INTEGER
    Passed <- 0
    FOR Index <- 1 TO Count
        INPUT Mark
        IF Mark >= 50 THEN
            Passed <- Passed + 1
        ENDIF
    NEXT Index
    RETURN Passed
ENDFUNCTION`,
    after: `OUTPUT CountPass(5)`,
    cases: [
      { label: "45, 50, 72, 49, 88", inputs: ["45", "50", "72", "49", "88"], after: "OUTPUT CountPass(5)" },
      { label: "three passes", inputs: ["50", "50", "50"], after: "OUTPUT CountPass(3)" },
      { label: "four fails", inputs: ["10", "20", "30", "40"], after: "OUTPUT CountPass(4)" },
      { label: "six mixed marks", inputs: ["51", "49", "75", "50", "99", "12"], after: "OUTPUT CountPass(6)" },
    ],
  },

  {
    id: "ob-loop-while-sentinel",
    title: "SumUntilZero() — sentinel loop",
    source: "原创 · §11.2 WHILE 哨兵",
    marks: 6,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "PROCEDURE SumUntilZero()",
    prompt: [
      "A procedure `SumUntilZero()` inputs whole numbers one at a time and adds each",
      "one to a running total. Input stops when 0 is input. The 0 is not added to the",
      "total. The procedure then outputs the total.",
      "",
      "For example, inputs 5, 10 and 0 output 15.",
      "",
      "Write pseudocode for `SumUntilZero()` using a `WHILE` loop, so that the total is",
      "0 when the first value input is 0."
    ].join("\n"),
    model: `PROCEDURE SumUntilZero()
    DECLARE Total : INTEGER
    DECLARE Value : INTEGER
    Total <- 0
    INPUT Value
    WHILE Value <> 0
        Total <- Total + Value
        INPUT Value
    ENDWHILE
    OUTPUT Total
ENDPROCEDURE`,
    after: `CALL SumUntilZero()`,
    cases: [
      { label: "5, 10, 0", inputs: ["5", "10", "0"] },
      { label: "7, 0", inputs: ["7", "0"] },
      { label: "0 only", inputs: ["0"] },
      { label: "2, 3, 4, 0", inputs: ["2", "3", "4", "0"] },
    ],
  },

  {
    id: "ob-loop-repeat-until",
    title: "EnterPin() — REPEAT UNTIL",
    source: "原创 · §11.2 REPEAT UNTIL",
    marks: 5,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "PROCEDURE EnterPin()",
    prompt: [
      "A door has the PIN 4821.",
      "",
      "A procedure `EnterPin()` inputs a PIN repeatedly until the correct PIN is input.",
      "It counts how many PINs were input, including the correct one, and outputs that",
      "count.",
      "",
      "For example, inputs 1111 and then 4821 output 2.",
      "",
      "Write pseudocode for `EnterPin()` using `REPEAT ... UNTIL`."
    ].join("\n"),
    model: `PROCEDURE EnterPin()
    DECLARE Attempts : INTEGER
    DECLARE Guess : INTEGER
    Attempts <- 0
    REPEAT
        INPUT Guess
        Attempts <- Attempts + 1
    UNTIL Guess = 4821
    OUTPUT Attempts
ENDPROCEDURE`,
    after: `CALL EnterPin()`,
    cases: [
      { label: "1111 then 4821", inputs: ["1111", "4821"] },
      { label: "correct first time", inputs: ["4821"] },
      { label: "three wrong then correct", inputs: ["0000", "1234", "9999", "4821"] },
    ],
  },

  {
    id: "ob-loop-build-string",
    title: "AddHyphens() — build a string",
    source: "原创 · §11.2 字符串累积",
    marks: 6,
    difficulty: 1,
    chapter: "Ch11 Programming",
    requirement: "FUNCTION AddHyphens(Word : STRING) RETURNS STRING",
    prompt: [
      "A function `AddHyphens()` takes a word and returns the same characters with a",
      "hyphen between each pair of characters.",
      "",
      "For example, `\"CAT\"` returns `\"C-A-T\"` and `\"A\"` returns `\"A\"`.",
      "",
      "Write pseudocode for `AddHyphens()`. Build the result one character at a time",
      "inside a loop. There is no hyphen before the first character or after the last."
    ].join("\n"),
    model: `FUNCTION AddHyphens(Word : STRING) RETURNS STRING
    DECLARE Result : STRING
    DECLARE Index : INTEGER
    Result <- ""
    FOR Index <- 1 TO LENGTH(Word)
        Result <- Result & MID(Word, Index, 1)
        IF Index < LENGTH(Word) THEN
            Result <- Result & "-"
        ENDIF
    NEXT Index
    RETURN Result
ENDFUNCTION`,
    after: `OUTPUT AddHyphens("CAT")`,
    cases: [
      { label: '"CAT"', after: 'OUTPUT AddHyphens("CAT")' },
      { label: '"hello"', after: 'OUTPUT AddHyphens("hello")' },
      { label: '"A"', after: 'OUTPUT AddHyphens("A")' },
      { label: '"12345"', after: 'OUTPUT AddHyphens("12345")' },
    ],
  },

  {
    id: "ob-loop-mod-multiples",
    title: "ShowMultiples() — multiples with MOD",
    source: "原创 · §11.2 MOD 倍数",
    marks: 6,
    difficulty: 1,
    chapter: "Ch09 Algorithm design",
    requirement: "PROCEDURE ShowMultiples(Factor : INTEGER, Limit : INTEGER)",
    prompt: [
      "A procedure `ShowMultiples()` takes a factor and a limit. It outputs every whole",
      "number from 1 to the limit inclusive that is a multiple of the factor, one per",
      "line.",
      "",
      "For example, `ShowMultiples(3, 10)` outputs 3, 6 and 9.",
      "",
      "Write pseudocode for `ShowMultiples()` using `MOD`."
    ].join("\n"),
    model: `PROCEDURE ShowMultiples(Factor : INTEGER, Limit : INTEGER)
    DECLARE Num : INTEGER
    FOR Num <- 1 TO Limit
        IF Num MOD Factor = 0 THEN
            OUTPUT Num
        ENDIF
    NEXT Num
ENDPROCEDURE`,
    after: `CALL ShowMultiples(3, 10)`,
    cases: [
      { label: "factor 3, limit 10", after: "CALL ShowMultiples(3, 10)" },
      { label: "factor 5, limit 12", after: "CALL ShowMultiples(5, 12)" },
      { label: "factor 7, limit 20", after: "CALL ShowMultiples(7, 20)" },
      { label: "factor 6, limit 6", after: "CALL ShowMultiples(6, 6)" },
    ],
  },

  {
    id: "ob-loop-pattern",
    title: "Triangle() — nested loop pattern",
    source: "原创 · §11.2 图形循环",
    marks: 8,
    difficulty: 2,
    chapter: "Ch11 Programming",
    requirement: "PROCEDURE Triangle(Rows : INTEGER)",
    prompt: [
      "A procedure `Triangle()` takes a number of rows and outputs a left-aligned",
      "triangle of asterisks: row 1 has one `*`, row 2 has two, and so on.",
      "",
      "For example, `Triangle(3)` outputs:",
      "*",
      "**",
      "***",
      "",
      "Write pseudocode for `Triangle()` using nested loops, with no spaces in the",
      "output."
    ].join("\n"),
    model: `PROCEDURE Triangle(Rows : INTEGER)
    DECLARE Row : INTEGER
    DECLARE Star : INTEGER
    DECLARE Line : STRING
    FOR Row <- 1 TO Rows
        Line <- ""
        FOR Star <- 1 TO Row
            Line <- Line & "*"
        NEXT Star
        OUTPUT Line
    NEXT Row
ENDPROCEDURE`,
    after: `CALL Triangle(3)`,
    cases: [
      { label: "3 rows", after: "CALL Triangle(3)" },
      { label: "1 row", after: "CALL Triangle(1)" },
      { label: "5 rows", after: "CALL Triangle(5)" },
    ],
  },
];
