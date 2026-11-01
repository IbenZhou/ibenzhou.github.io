---
section: 8.3
kind: dml
title: How many loans each member has
marks: 3
coverage: SELECT, COUNT, GROUP BY
schema: |
  LOAN(LoanID, MemberID, ISBN, LoanDate)
prompt: |
  Write an SQL query that returns, for each member, the member's number and the
  **number of loans** that member has made.
seed: |
  CREATE TABLE Loan (
    LoanID INTEGER PRIMARY KEY,
    MemberID INTEGER,
    ISBN VARCHAR(13),
    LoanDate DATE
  );
  INSERT INTO Loan VALUES
    (1, 101, '9781111111111', '2026-01-08'),
    (2, 102, '9782222222222', '2026-01-12'),
    (3, 101, '9783333333333', '2026-02-01'),
    (4, 103, '9781111111111', '2026-02-04'),
    (5, 103, '9782222222222', '2026-02-15');
answer: |
  SELECT MemberID, COUNT(LoanID)
  FROM Loan
  GROUP BY MemberID;
check: rows
wrong: |
  SELECT MemberID, COUNT(LoanID)
  FROM Loan
  GROUP BY LoanID;
---
