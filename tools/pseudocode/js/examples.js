const ex = (name, group, blurb, code, inputs) => ({ name, group, blurb, code: code.replace(/^\n/, "").replace(/\s+$/, "\n"), inputs });

export const EXAMPLES = [
  ex("Hello", "Basics", "OUTPUT writes one line per statement", `
OUTPUT "Hello, world!"
OUTPUT 42
OUTPUT TRUE
`),

  ex("Variables and constants", "Basics", "DECLARE then assign with <-", `
DECLARE Counter : INTEGER
DECLARE TotalToPay : REAL
DECLARE GameOver : BOOLEAN
CONSTANT HourlyRate = 6.50
DECLARE NumberOfHours : INTEGER

Counter <- 0
NumberOfHours <- 8
TotalToPay <- NumberOfHours * HourlyRate
GameOver <- FALSE
Counter <- Counter + 1

OUTPUT Counter
OUTPUT TotalToPay
OUTPUT GameOver
`),

  ex("Input", "Basics", "INPUT reads one value from the input box", `
DECLARE Name : STRING
DECLARE Age : INTEGER

OUTPUT "What is your name?"
INPUT Name
OUTPUT "What is your age?"
INPUT Age
OUTPUT "Hello ", Name, " aged ", Age
`, ["Amara", "17"]),

  ex("One-dimensional array", "Data", "Fixed bounds, 1-based by convention", `
DECLARE Grades : ARRAY[1:5] OF INTEGER
DECLARE Total : INTEGER
DECLARE Position : INTEGER

FOR Position <- 1 TO 5
    INPUT Grades[Position]
NEXT Position

Total <- 0
FOR Position <- 1 TO 5
    Total <- Total + Grades[Position]
NEXT Position

OUTPUT Total
OUTPUT Total / 5
`, ["12", "15", "9", "20", "4"]),

  ex("Two-dimensional array", "Data", "ARRAY[lower1:upper1,lower2:upper2]", `
DECLARE Grid : ARRAY[1:3,1:3] OF CHAR
DECLARE Row : INTEGER
DECLARE Column : INTEGER

FOR Row <- 1 TO 3
    FOR Column <- 1 TO 3
        Grid[Row, Column] <- '.'
    NEXT Column
NEXT Row

Grid[2, 2] <- 'X'

FOR Row <- 1 TO 3
    OUTPUT Grid[Row, 1], Grid[Row, 2], Grid[Row, 3]
NEXT Row
`, []),

  ex("String functions", "Data", "Guide 5.5: LENGTH, MID, RIGHT, LCASE, UCASE", `
DECLARE Word : STRING
DECLARE Letter : CHAR

Word <- "ABCDEFGH"
OUTPUT LENGTH(Word)
OUTPUT MID(Word, 2, 3)
OUTPUT RIGHT(Word, 3)
Letter <- 'w'
OUTPUT LCASE(Letter)
OUTPUT UCASE(Letter)
OUTPUT Word & "!"
`, []),

  ex("Arithmetic", "Data", "/ gives REAL, DIV gives the quotient, MOD the remainder", `
DECLARE Quotient : INTEGER
DECLARE Remainder : INTEGER

OUTPUT 7 / 2
OUTPUT 7 DIV 2
OUTPUT 7 MOD 2
Quotient <- 100 DIV 7
Remainder <- 100 MOD 7
OUTPUT Quotient
OUTPUT Remainder
`, []),

  ex("Nested IF", "Selection", "Guide 6.1: every IF needs its own ENDIF", `
DECLARE ChallengerScore : INTEGER
DECLARE ChampionScore : INTEGER
DECLARE HighestScore : INTEGER

ChallengerScore <- 85
ChampionScore <- 72
HighestScore <- 90

IF ChallengerScore > ChampionScore THEN
    IF ChallengerScore > HighestScore THEN
        OUTPUT "New champion and highest scorer"
    ELSE
        OUTPUT "New champion"
    ENDIF
ELSE
    OUTPUT "Champion retains the title"
ENDIF
`, []),

  ex("CASE OF", "Selection", "Labels may be values, ranges, or OTHERWISE", `
DECLARE Move : CHAR
DECLARE Position : INTEGER

Position <- 10
Move <- 's'

CASE OF Move
    'w' : Position <- Position - 10
    's' : Position <- Position + 10
    'a' : Position <- Position - 1
    'd' : Position <- Position + 1
    OTHERWISE : OUTPUT "Invalid move"
ENDCASE

OUTPUT Position
`, []),

  ex("CASE with ranges", "Selection", "A label can be a range with TO", `
DECLARE Mark : INTEGER
Mark <- 73

CASE OF Mark
    0 TO 39 : OUTPUT "U"
    40 TO 49 : OUTPUT "4"
    50 TO 59 : OUTPUT "3"
    60 TO 69 : OUTPUT "2"
    70 TO 79 : OUTPUT "1"
    80 TO 100 : OUTPUT "A*"
    OTHERWISE : OUTPUT "Invalid mark"
ENDCASE
`, []),

  ex("FOR with STEP", "Iteration", "A negative STEP counts down", `
DECLARE Total : INTEGER

Total <- 0
FOR Count <- 10 TO 1 STEP -2
    OUTPUT Count
    Total <- Total + Count
NEXT Count

OUTPUT Total
`, []),

  ex("WHILE loop", "Iteration", "Pre-condition tested before each pass", `
DECLARE Number : INTEGER

Number <- 100
WHILE Number > 9
    Number <- Number - 9
ENDWHILE

OUTPUT Number
`, []),

  ex("REPEAT UNTIL", "Iteration", "Post-condition, so the body always runs once", `
DECLARE Password : STRING
DECLARE Attempts : INTEGER

Attempts <- 0
REPEAT
    OUTPUT "Please enter the password"
    INPUT Password
    Attempts <- Attempts + 1
UNTIL Password = "Secret"

OUTPUT "Access granted after ", Attempts, " attempts"
`, ["wrong", "nope", "Secret"]),

  ex("Procedure", "Routines", "CALL runs a PROCEDURE, which has no value", `
PROCEDURE PrintSquare(Size : INTEGER)
    DECLARE Side : INTEGER
    FOR Side <- 1 TO 4
        OUTPUT Size
    NEXT Side
ENDPROCEDURE

PROCEDURE DefaultSquare()
    CALL PrintSquare(100)
ENDPROCEDURE

DECLARE Size : INTEGER
Size <- 7
IF Size = 0 THEN
    CALL DefaultSquare()
ELSE
    CALL PrintSquare(Size)
ENDIF
`, []),

  ex("Function", "Routines", "FUNCTION RETURNS a type and is used inside an expression", `
FUNCTION Max(Number1 : INTEGER, Number2 : INTEGER) RETURNS INTEGER
    IF Number1 > Number2 THEN
        RETURN Number1
    ELSE
        RETURN Number2
    ENDIF
ENDFUNCTION

DECLARE Distance : INTEGER
Distance <- 6
OUTPUT "Penalty Fine = ", Max(10, Distance * 2)
`, []),

  ex("Pass by reference", "Routines", "BYREF lets a procedure change the caller's variable", `
PROCEDURE SWAP(BYREF X : INTEGER, Y : INTEGER)
    DECLARE Temp : INTEGER
    Temp <- X
    X <- Y
    Y <- Temp
ENDPROCEDURE

DECLARE A : INTEGER
DECLARE B : INTEGER
A <- 1
B <- 2
CALL SWAP(A, B)
OUTPUT A
OUTPUT B
`, []),

  ex("Recursion", "Routines", "A FUNCTION may call itself, with a stopping case", `
FUNCTION Factorial(N : INTEGER) RETURNS INTEGER
    IF N <= 1 THEN
        RETURN 1
    ELSE
        RETURN N * Factorial(N - 1)
    ENDIF
ENDFUNCTION

DECLARE Answer : INTEGER
Answer <- Factorial(6)
OUTPUT Answer
`, []),

  ex("Bubble sort", "Algorithms", "The sort the syllabus names by name", `
DECLARE Data : ARRAY[1:8] OF INTEGER
DECLARE Passes : INTEGER
DECLARE Index : INTEGER
DECLARE Temp : INTEGER
DECLARE Swapped : BOOLEAN

Data[1] <- 5
Data[2] <- 2
Data[3] <- 9
Data[4] <- 1
Data[5] <- 7
Data[6] <- 3
Data[7] <- 8
Data[8] <- 4

Passes <- 1
REPEAT
    Swapped <- FALSE
    FOR Index <- 1 TO 7
        IF Data[Index] > Data[Index + 1] THEN
            Temp <- Data[Index]
            Data[Index] <- Data[Index + 1]
            Data[Index + 1] <- Temp
            Swapped <- TRUE
        ENDIF
    NEXT Index
    Passes <- Passes + 1
UNTIL Swapped = FALSE

FOR Index <- 1 TO 8
    OUTPUT Data[Index]
NEXT Index
`, []),

  ex("Binary search", "Algorithms", "Sorted data, halving the range each pass", `
DECLARE Data : ARRAY[1:8] OF INTEGER
DECLARE Target : INTEGER
DECLARE LowerBound : INTEGER
DECLARE UpperBound : INTEGER
DECLARE Middle : INTEGER
DECLARE Found : BOOLEAN

Data[1] <- 3
Data[2] <- 7
Data[3] <- 11
Data[4] <- 15
Data[5] <- 19
Data[6] <- 23
Data[7] <- 27
Data[8] <- 31

Target <- 19
LowerBound <- 1
UpperBound <- 8
Found <- FALSE

WHILE LowerBound <= UpperBound AND Found = FALSE
    Middle <- (LowerBound + UpperBound) DIV 2
    IF Data[Middle] = Target THEN
        Found <- TRUE
    ELSE
        IF Data[Middle] < Target THEN
            LowerBound <- Middle + 1
        ELSE
            UpperBound <- Middle - 1
        ENDIF
    ENDIF
ENDWHILE

IF Found THEN
    OUTPUT "Found at ", Middle
ELSE
    OUTPUT "Not found"
ENDIF
`, []),

  ex("Linear search", "Algorithms", "Check every element until a match", `
DECLARE Names : ARRAY[1:5] OF STRING
DECLARE Index : INTEGER
DECLARE Target : STRING
DECLARE Position : INTEGER

Names[1] <- "Amara"
Names[2] <- "Bo"
Names[3] <- "Chen"
Names[4] <- "Dua"
Names[5] <- "Efe"

Target <- "Chen"
Position <- 0
FOR Index <- 1 TO 5
    IF Names[Index] = Target THEN
        Position <- Index
    ENDIF
NEXT Index

IF Position = 0 THEN
    OUTPUT "Not found"
ELSE
    OUTPUT "Found at position ", Position
ENDIF
`, []),

  ex("Maximum of n inputs", "Algorithms", "Your loop exercise, written exam-style", `
DECLARE Numbers : ARRAY[1:10] OF INTEGER
DECLARE N : INTEGER
DECLARE Index : INTEGER
DECLARE Largest : INTEGER

INPUT N
FOR Index <- 1 TO N
    INPUT Numbers[Index]
NEXT Index

Largest <- Numbers[1]
FOR Index <- 2 TO N
    IF Numbers[Index] > Largest THEN
        Largest <- Numbers[Index]
    ENDIF
NEXT Index

OUTPUT Largest
`, ["5", "12", "40", "7", "19", "3"]),

  ex("Palindrome", "Algorithms", "Compare characters moving in from both ends", `
DECLARE Word : STRING
DECLARE Left : INTEGER
DECLARE Right : INTEGER
DECLARE IsPalindrome : BOOLEAN

Word <- "LEVEL"
Left <- 1
Right <- LENGTH(Word)
IsPalindrome <- TRUE

WHILE Left < Right
    IF MID(Word, Left, 1) <> MID(Word, Right, 1) THEN
        IsPalindrome <- FALSE
    ENDIF
    Left <- Left + 1
    Right <- Right - 1
ENDWHILE

OUTPUT IsPalindrome
`, []),

  ex("Prime check", "Algorithms", "Trial division with MOD", `
FUNCTION IsPrime(N : INTEGER) RETURNS BOOLEAN
    DECLARE Test : INTEGER
    IF N < 2 THEN
        RETURN FALSE
    ENDIF
    FOR Test <- 2 TO N - 1
        IF N MOD Test = 0 THEN
            RETURN FALSE
        ENDIF
    NEXT Test
    RETURN TRUE
ENDFUNCTION

DECLARE Candidate : INTEGER
FOR Candidate <- 1 TO 12
    OUTPUT Candidate, " ", IsPrime(Candidate)
NEXT Candidate
`, []),

  ex("Random numbers", "Algorithms", "RAND(x) gives a REAL from 0 up to but not including x", `
DECLARE Dice : INTEGER
DECLARE Roll : INTEGER

FOR Roll <- 1 TO 5
    Dice <- INT(RAND(6) + 1)
    OUTPUT Dice
NEXT Roll
`, []),
];


const ig = (name, group, blurb, code, inputs) => ({ name, group, blurb, code: code.replace(/^\n/, "").replace(/\s+$/, "\n"), inputs });

export const IGCSE_EXAMPLES = [
  ig("Hello", "Basics", "OUTPUT writes one line per statement", `
OUTPUT "Hello, world!"
OUTPUT 42
OUTPUT TRUE
`),

  ig("Variables and constants", "Basics", "CONSTANT uses the arrow in IGCSE", `
DECLARE Counter : INTEGER
DECLARE TotalToPay : REAL
DECLARE GameOver : BOOLEAN
CONSTANT HourlyRate ← 6.50
DECLARE NumberOfHours : INTEGER

Counter ← 0
NumberOfHours ← 8
TotalToPay ← NumberOfHours * HourlyRate
GameOver ← FALSE
Counter ← Counter + 1

OUTPUT Counter
OUTPUT TotalToPay
OUTPUT GameOver
`),

  ig("Input", "Basics", "INPUT reads one value from the input box", `
DECLARE Name : STRING
DECLARE Age : INTEGER

OUTPUT "What is your name?"
INPUT Name
OUTPUT "What is your age?"
INPUT Age
OUTPUT "Hello ", Name, " aged ", Age
`, ["Amara", "17"]),

  ig("One-dimensional array", "Data", "Fixed bounds, 1-based by convention", `
DECLARE Grades : ARRAY[1:5] OF INTEGER
DECLARE Total : INTEGER
DECLARE Position : INTEGER

FOR Position ← 1 TO 5
    INPUT Grades[Position]
NEXT Position

Total ← 0
FOR Position ← 1 TO 5
    Total ← Total + Grades[Position]
NEXT Position

OUTPUT Total
OUTPUT Total / 5
`, ["12", "15", "9", "20", "4"]),

  ig("Two-dimensional array", "Data", "ARRAY[lower1:upper1, lower2:upper2]", `
DECLARE Grid : ARRAY[1:3, 1:3] OF CHAR
DECLARE Row : INTEGER
DECLARE Column : INTEGER

FOR Row ← 1 TO 3
    FOR Column ← 1 TO 3
        Grid[Row, Column] ← '.'
    NEXT Column
NEXT Row

Grid[2, 2] ← 'X'

FOR Row ← 1 TO 3
    OUTPUT Grid[Row, 1], Grid[Row, 2], Grid[Row, 3]
NEXT Row
`, []),

  ig("String functions", "Data", "IGCSE uses SUBSTRING, not MID", `
DECLARE Word : STRING
DECLARE Letter : CHAR

Word ← "ABCDEFGH"
OUTPUT LENGTH(Word)
OUTPUT SUBSTRING(Word, 2, 3)
OUTPUT SUBSTRING(Word, 6, 3)
Letter ← 'w'
OUTPUT LCASE(Letter)
OUTPUT UCASE(Letter)
OUTPUT Word & "!"
`, []),

  ig("Arithmetic", "Data", "IGCSE writes MOD and DIV as functions", `
DECLARE Quotient : INTEGER
DECLARE Remainder : INTEGER

OUTPUT 7 / 2
OUTPUT DIV(7, 2)
OUTPUT MOD(7, 2)
Quotient ← DIV(100, 7)
Remainder ← MOD(100, 7)
OUTPUT Quotient
OUTPUT Remainder
`, []),

  ig("Nested IF", "Selection", "THEN sits on its own line in IGCSE", `
DECLARE ChallengerScore : INTEGER
DECLARE ChampionScore : INTEGER
DECLARE HighestScore : INTEGER

ChallengerScore ← 85
ChampionScore ← 72
HighestScore ← 90

IF ChallengerScore > ChampionScore
    THEN
        IF ChallengerScore > HighestScore
            THEN
                OUTPUT "New champion and highest scorer"
            ELSE
                OUTPUT "New champion"
        ENDIF
    ELSE
        OUTPUT "Champion retains the title"
ENDIF
`, []),

  ig("CASE OF", "Selection", "OTHERWISE takes no colon in IGCSE", `
DECLARE Move : CHAR
DECLARE Position : INTEGER

Position ← 10
Move ← 's'

CASE OF Move
    'w' : Position ← Position - 10
    's' : Position ← Position + 10
    'a' : Position ← Position - 1
    'd' : Position ← Position + 1
    OTHERWISE OUTPUT "Invalid move"
ENDCASE

OUTPUT Position
`, []),

  ig("CASE with ranges", "Selection", "IGCSE CASE takes single values, so grading is written with IF", `
DECLARE Mark : INTEGER
Mark ← 73

IF Mark < 40
    THEN
        OUTPUT "U"
    ELSE
        IF Mark < 50
            THEN
                OUTPUT "4"
            ELSE
                IF Mark < 70
                    THEN
                        OUTPUT "2"
                    ELSE
                        IF Mark < 80
                            THEN
                                OUTPUT "1"
                            ELSE
                                OUTPUT "A*"
                        ENDIF
                ENDIF
        ENDIF
ENDIF
`, []),

  ig("FOR with STEP", "Iteration", "A negative STEP counts down", `
DECLARE Total : INTEGER

Total ← 0
FOR Count ← 10 TO 1 STEP -2
    OUTPUT Count
    Total ← Total + Count
NEXT Count

OUTPUT Total
`, []),

  ig("WHILE loop", "Iteration", "IGCSE writes WHILE <condition> DO", `
DECLARE Number : INTEGER

Number ← 100
WHILE Number > 9 DO
    Number ← Number - 9
ENDWHILE

OUTPUT Number
`, []),

  ig("REPEAT UNTIL", "Iteration", "Post-condition, so the body always runs once", `
DECLARE Password : STRING
DECLARE Attempts : INTEGER

Attempts ← 0
REPEAT
    OUTPUT "Please enter the password"
    INPUT Password
    Attempts ← Attempts + 1
UNTIL Password = "Secret"

OUTPUT "Access granted after ", Attempts, " attempts"
`, ["wrong", "nope", "Secret"]),

  ig("Procedure", "Routines", "No parameters means no brackets, in the definition or the call", `
PROCEDURE PrintSquare(Size : INTEGER)
    DECLARE Side : INTEGER
    FOR Side ← 1 TO 4
        OUTPUT Size
    NEXT Side
ENDPROCEDURE

PROCEDURE DefaultSquare
    CALL PrintSquare(100)
ENDPROCEDURE

DECLARE Size : INTEGER
Size ← 7
IF Size = 0
    THEN
        CALL DefaultSquare
    ELSE
        CALL PrintSquare(Size)
ENDIF
`, []),

  ig("Function", "Routines", "FUNCTION RETURNS a type and is used inside an expression", `
FUNCTION Max(Number1 : INTEGER, Number2 : INTEGER) RETURNS INTEGER
    IF Number1 > Number2
        THEN
            RETURN Number1
        ELSE
            RETURN Number2
    ENDIF
ENDFUNCTION

DECLARE Distance : INTEGER
Distance ← 6
OUTPUT "Penalty Fine = ", Max(10, Distance * 2)
`, []),

  ig("Pass by value", "Routines", "IGCSE has no BYREF, so SWAP cannot change the caller's variables", `
PROCEDURE SWAP(X : INTEGER, Y : INTEGER)
    DECLARE Temp : INTEGER
    Temp ← X
    X ← Y
    Y ← Temp
ENDPROCEDURE

DECLARE A : INTEGER
DECLARE B : INTEGER
A ← 1
B ← 2
CALL SWAP(A, B)
OUTPUT A
OUTPUT B
`, []),

  ig("Recursion", "Routines", "A FUNCTION may call itself, with a stopping case", `
FUNCTION Factorial(N : INTEGER) RETURNS INTEGER
    IF N <= 1
        THEN
            RETURN 1
        ELSE
            RETURN N * Factorial(N - 1)
    ENDIF
ENDFUNCTION

DECLARE Answer : INTEGER
Answer ← Factorial(6)
OUTPUT Answer
`, []),

  ig("Bubble sort", "Algorithms", "The sort the syllabus names by name", `
DECLARE Data : ARRAY[1:8] OF INTEGER
DECLARE Passes : INTEGER
DECLARE Index : INTEGER
DECLARE Temp : INTEGER
DECLARE Swapped : BOOLEAN

Data[1] ← 5
Data[2] ← 2
Data[3] ← 9
Data[4] ← 1
Data[5] ← 7
Data[6] ← 3
Data[7] ← 8
Data[8] ← 4

Passes ← 1
REPEAT
    Swapped ← FALSE
    FOR Index ← 1 TO 7
        IF Data[Index] > Data[Index + 1]
            THEN
                Temp ← Data[Index]
                Data[Index] ← Data[Index + 1]
                Data[Index + 1] ← Temp
                Swapped ← TRUE
        ENDIF
    NEXT Index
    Passes ← Passes + 1
UNTIL Swapped = FALSE

FOR Index ← 1 TO 8
    OUTPUT Data[Index]
NEXT Index
`, []),

  ig("Binary search", "Algorithms", "Sorted data, halving the range with DIV", `
DECLARE Data : ARRAY[1:8] OF INTEGER
DECLARE Target : INTEGER
DECLARE LowerBound : INTEGER
DECLARE UpperBound : INTEGER
DECLARE Middle : INTEGER
DECLARE Found : BOOLEAN

Data[1] ← 3
Data[2] ← 7
Data[3] ← 11
Data[4] ← 15
Data[5] ← 19
Data[6] ← 23
Data[7] ← 27
Data[8] ← 31

Target ← 19
LowerBound ← 1
UpperBound ← 8
Found ← FALSE

WHILE LowerBound <= UpperBound AND Found = FALSE DO
    Middle ← DIV(LowerBound + UpperBound, 2)
    IF Data[Middle] = Target
        THEN
            Found ← TRUE
        ELSE
            IF Data[Middle] < Target
                THEN
                    LowerBound ← Middle + 1
                ELSE
                    UpperBound ← Middle - 1
            ENDIF
    ENDIF
ENDWHILE

IF Found
    THEN
        OUTPUT "Found at ", Middle
    ELSE
        OUTPUT "Not found"
ENDIF
`, []),

  ig("Linear search", "Algorithms", "Check every element until a match", `
DECLARE Names : ARRAY[1:5] OF STRING
DECLARE Index : INTEGER
DECLARE Target : STRING
DECLARE Position : INTEGER

Names[1] ← "Amara"
Names[2] ← "Bo"
Names[3] ← "Chen"
Names[4] ← "Dua"
Names[5] ← "Efe"

Target ← "Chen"
Position ← 0
FOR Index ← 1 TO 5
    IF Names[Index] = Target
        THEN
            Position ← Index
    ENDIF
NEXT Index

IF Position = 0
    THEN
        OUTPUT "Not found"
    ELSE
        OUTPUT "Found at position ", Position
ENDIF
`, []),

  ig("Maximum of n inputs", "Algorithms", "Your loop exercise, written exam-style", `
DECLARE Numbers : ARRAY[1:10] OF INTEGER
DECLARE N : INTEGER
DECLARE Index : INTEGER
DECLARE Largest : INTEGER

INPUT N
FOR Index ← 1 TO N
    INPUT Numbers[Index]
NEXT Index

Largest ← Numbers[1]
FOR Index ← 2 TO N
    IF Numbers[Index] > Largest
        THEN
            Largest ← Numbers[Index]
    ENDIF
NEXT Index

OUTPUT Largest
`, ["5", "12", "40", "7", "19", "3"]),

  ig("Palindrome", "Algorithms", "Compare characters moving in from both ends", `
DECLARE Word : STRING
DECLARE Left : INTEGER
DECLARE Right : INTEGER
DECLARE IsPalindrome : BOOLEAN

Word ← "LEVEL"
Left ← 1
Right ← LENGTH(Word)
IsPalindrome ← TRUE

WHILE Left < Right DO
    IF SUBSTRING(Word, Left, 1) <> SUBSTRING(Word, Right, 1)
        THEN
            IsPalindrome ← FALSE
    ENDIF
    Left ← Left + 1
    Right ← Right - 1
ENDWHILE

OUTPUT IsPalindrome
`, []),

  ig("Prime check", "Algorithms", "Trial division with MOD as a function", `
FUNCTION IsPrime(N : INTEGER) RETURNS BOOLEAN
    DECLARE Test : INTEGER
    IF N < 2
        THEN
            RETURN FALSE
    ENDIF
    FOR Test ← 2 TO N - 1
        IF MOD(N, Test) = 0
            THEN
                RETURN FALSE
        ENDIF
    NEXT Test
    RETURN TRUE
ENDFUNCTION

DECLARE Candidate : INTEGER
FOR Candidate ← 1 TO 12
    OUTPUT Candidate, " ", IsPrime(Candidate)
NEXT Candidate
`, []),

  ig("Random numbers", "Algorithms", "RANDOM() gives a real from 0 to 1", `
DECLARE Roll : INTEGER

FOR Roll ← 1 TO 5
    OUTPUT RANDOM()
NEXT Roll
`, []),

  ig("Dice roll", "Algorithms", "ROUND(RANDOM() * 5, 0) + 1 gives 1 to 6", `
DECLARE Dice : INTEGER
DECLARE Roll : INTEGER

FOR Roll ← 1 TO 6
    Dice ← ROUND(RANDOM() * 5, 0) + 1
    OUTPUT Dice
NEXT Roll
`, []),

  ig("Powers", "Data", "IGCSE writes a power with ^", `
DECLARE Power : INTEGER

FOR Power ← 1 TO 5
    OUTPUT "2 ^ ", Power, " = ", 2 ^ Power
NEXT Power
OUTPUT 3.0 ^ 2
`, []),
];

export function examplesFor(dialectId) {
  return dialectId === "0478" ? IGCSE_EXAMPLES : EXAMPLES;
}
