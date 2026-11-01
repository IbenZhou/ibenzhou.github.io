---
section: 8.3
kind: dml
title: Waive one member's fine
marks: 3
coverage: UPDATE, SET, WHERE
schema: |
  MEMBER(MemberID, FullName, Email, OnLoan, Fine, DateJoined)
prompt: |
  Member **101** has paid in cash, so the fine is no longer owed. Write an SQL statement
  that sets that member's **Fine** to **0**, leaving every other member unchanged.
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
  UPDATE Member
  SET Fine = 0
  WHERE MemberID = 101;
check: table
checktable: Member
wrong: |
  UPDATE Member
  SET Fine = 0;
---
