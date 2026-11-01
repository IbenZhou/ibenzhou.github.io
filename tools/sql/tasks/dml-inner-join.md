---
section: 8.3
kind: dml
title: Books that have been borrowed
marks: 4
coverage: SELECT, FROM, INNER JOIN, WHERE
schema: |
  BOOK(ISBN, Title, Subject, Pages)
  LOAN(LoanID, MemberID, ISBN, LoanDate)
prompt: |
  Write an SQL query that returns the **Title** of every book together with the
  **LoanDate** of the loan it was taken out on. Only books that have actually been
  borrowed should appear.
seed: |
  CREATE TABLE Book (
    ISBN VARCHAR(13) PRIMARY KEY,
    Title VARCHAR(60),
    Subject VARCHAR(30),
    Pages INTEGER
  );
  CREATE TABLE Loan (
    LoanID INTEGER PRIMARY KEY,
    MemberID INTEGER,
    ISBN VARCHAR(13),
    LoanDate DATE
  );
  INSERT INTO Book VALUES
    ('9781111111111', 'The Longest Winter', 'Fiction', 312),
    ('9782222222222', 'Cells and Clocks', 'Science', 208),
    ('9783333333333', 'Numbers in Nature', 'Mathematics', 176),
    ('9784444444444', 'Mapmakers of Prague', 'History', 402);
  INSERT INTO Loan VALUES
    (1, 101, '9781111111111', '2026-01-08'),
    (2, 102, '9782222222222', '2026-01-12'),
    (3, 101, '9783333333333', '2026-02-01');
answer: |
  SELECT Book.Title, Loan.LoanDate
  FROM Book
  INNER JOIN Loan ON Book.ISBN = Loan.ISBN;
check: rows
wrong: |
  SELECT Book.Title, Loan.LoanDate
  FROM Book, Loan;
---
