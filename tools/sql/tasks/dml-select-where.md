---
section: 8.3
kind: dml
title: Members who owe more than 2.50
marks: 3
coverage: SELECT, FROM, WHERE
schema: |
  MEMBER(MemberID, FullName, Email, OnLoan, Fine, DateJoined)
prompt: |
  Write an SQL query that returns the **FullName** and **Email** of every member whose
  **Fine** is greater than 2.50.
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
    (103, 'Chen Yu', 'chen@ridgeway.example', TRUE, 2.50, '2023-10-02'),
    (105, 'Mei Ling', 'mei@ridgeway.example', TRUE, 8.20, '2026-02-11');
answer: |
  SELECT FullName, Email
  FROM Member
  WHERE Fine > 2.50;
check: rows
wrong: |
  SELECT FullName, Email
  FROM Member
  WHERE Fine >= 2.50;
---
