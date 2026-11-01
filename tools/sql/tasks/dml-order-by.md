---
section: 8.3
kind: dml
title: Members in joining order
marks: 3
coverage: SELECT, FROM, ORDER BY, DESC
schema: |
  MEMBER(MemberID, FullName, Email, OnLoan, Fine, DateJoined)
prompt: |
  Write an SQL query that returns the **FullName** and **DateJoined** of every member,
  with the member who joined most recently listed first.
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
  SELECT FullName, DateJoined
  FROM Member
  ORDER BY DateJoined DESC;
check: ordered
wrong: |
  SELECT FullName, DateJoined
  FROM Member
  ORDER BY DateJoined;
---
