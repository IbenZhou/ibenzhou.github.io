---
section: 8.3
kind: dml
title: Add a member with only some details
marks: 3
difficulty: basic
source: 原创 · 考纲 8.3 补全（INSERT 指定列）
coverage: INSERT INTO
schema: |
  CLUB(MemberID, FullName, Email, Joined)
prompt: |
  Add member number **7**, name **Nia Roberts**, to the Club table. Her email address and
  joining date are not known yet, so the statement must leave those two fields empty
  instead of guessing them.
seed: |
  CREATE TABLE Club (
    MemberID INTEGER PRIMARY KEY,
    FullName VARCHAR(30),
    Email VARCHAR(60),
    Joined DATE
  );
  INSERT INTO Club VALUES (1, 'Sam Okafor', 'sam@example.org', '2025-01-04');
answer: |
  INSERT INTO Club (MemberID, FullName)
  VALUES (7, 'Nia Roberts');
wrong: |
  INSERT INTO Club (MemberID, FullName)
  VALUES (8, 'Nia Roberts');
check: table
checktable: Club
---
