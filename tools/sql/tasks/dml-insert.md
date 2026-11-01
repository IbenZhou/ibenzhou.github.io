---
section: 8.3
kind: dml
title: Register a new member
marks: 3
coverage: INSERT INTO, VALUES
schema: |
  MEMBER(MemberID, FullName, Email, OnLoan, Fine, DateJoined)
prompt: |
  A new member joins the club on 1 September 2026. Write an SQL statement that adds
  this member to the Member table: number **104**, name **Priya Raman**, email
  **priya@ridgeway.example**, not currently holding a loan, fine **0**, joined
  **2026-09-01**.
seed: |
  CREATE TABLE Member (
    MemberID INTEGER PRIMARY KEY,
    FullName VARCHAR(40),
    Email VARCHAR(60),
    OnLoan BOOLEAN,
    Fine REAL,
    DateJoined DATE
  );
  INSERT INTO Member VALUES
    (101, 'Ada Nwosu', 'ada@ridgeway.example', TRUE, 4.75, '2024-09-05'),
    (102, 'Bo Halvorsen', 'bo@ridgeway.example', FALSE, 0, '2025-01-16'),
    (103, 'Chen Yu', 'chen@ridgeway.example', TRUE, 2.50, '2023-10-02');
answer: |
  INSERT INTO Member
  VALUES (104, 'Priya Raman', 'priya@ridgeway.example', FALSE, 0, '2026-09-01');
check: table
checktable: Member
wrong: |
  INSERT INTO Member
  VALUES (104, 'Priya Raman', 'priya@ridgeway.example', TRUE, 0, '2026-09-01');
---
