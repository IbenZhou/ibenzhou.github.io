---
section: 8.3
kind: ddl
title: Make a field the primary key
marks: 2
coverage: ALTER TABLE, PRIMARY KEY
schema: |
  LOAN(LoanID, LoanDate)
prompt: |
  The Loan table was created without a key. Using **ALTER TABLE**, make
  **LoanID** the primary key of Loan. Do not drop or recreate the table.
seed: |
  CREATE TABLE Loan (
    LoanID INTEGER,
    LoanDate DATE
  );
answer: |
  ALTER TABLE Loan ADD PRIMARY KEY (LoanID);
check: schema
checktable: Loan
wrong: |
  ALTER TABLE Loan ADD UNIQUE (LoanID);
---
