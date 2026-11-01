---
section: 8.3
kind: dml
title: Total and average fine
marks: 3
coverage: SELECT, SUM, AVG
schema: |
  MEMBER(MemberID, FullName, Email, OnLoan, Fine, DateJoined)
prompt: |
  Write an SQL query that returns the **total** of all the fines owed by members and the
  **average** fine.
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
  SELECT SUM(Fine), AVG(Fine)
  FROM Member;
check: rows
wrong: |
  SELECT SUM(Fine)
  FROM Member;
---
