---
section: 8.3
kind: dml
title: Average fee of active members
marks: 3
difficulty: advanced
source: 原创 · 考纲 8.3 补全（AVG）
coverage: SELECT, AVG, WHERE
schema: |
  MEMBER(MemberID, FullName, Active, Fee)
prompt: |
  Return the **average fee** of the members who are currently **active**.
seed: |
  CREATE TABLE Member (
    MemberID INTEGER PRIMARY KEY,
    FullName VARCHAR(30),
    Active BOOLEAN,
    Fee REAL
  );
  INSERT INTO Member VALUES
    (1, 'Nia Roberts', TRUE, 40.00),
    (2, 'Sam Okafor', TRUE, 52.50),
    (3, 'Ivy Chen', FALSE, 10.00),
    (4, 'Leo Marsh', FALSE, 30.00);
answer: |
  SELECT AVG(Fee)
  FROM Member
  WHERE Active = TRUE;
wrong: |
  SELECT AVG(Fee)
  FROM Member;
check: rows
---
