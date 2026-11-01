---
section: 8.3
kind: dml
title: Remove a member's loans
marks: 3
coverage: DELETE FROM, WHERE
schema: |
  LOAN(LoanID, MemberID, ISBN, LoanDate)
prompt: |
  Member **103** has left the school, so all of that member's loan records are deleted.
  Write an SQL statement that removes **only** member 103's loans from the Loan table.
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
  DELETE FROM Loan
  WHERE MemberID = 103;
check: table
checktable: Loan
wrong: |
  DELETE FROM Loan;
---
