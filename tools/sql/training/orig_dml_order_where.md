---
section: 8.3
kind: dml
title: Passing students, best first
marks: 3
difficulty: advanced
source: 原创 · 考纲 8.3 补全（ORDER BY + WHERE）
coverage: SELECT, ORDER BY, WHERE
schema: |
  RESULT(ResultID, Name, Score, Passed)
prompt: |
  Return the **Name** and **Score** of every student who **passed**, with the highest
  score listed first.
seed: |
  CREATE TABLE Result (
    ResultID INTEGER PRIMARY KEY,
    Name VARCHAR(30),
    Score REAL,
    Passed BOOLEAN
  );
  INSERT INTO Result VALUES
    (1, 'Nia', 72.5, TRUE),
    (2, 'Omar', 48.0, FALSE),
    (3, 'Rui', 91.0, TRUE),
    (4, 'Sara', 65.0, TRUE);
answer: |
  SELECT Name, Score
  FROM Result
  WHERE Passed = TRUE
  ORDER BY Score DESC;
wrong: |
  SELECT Name, Score
  FROM Result
  WHERE Passed = TRUE
  ORDER BY Score ASC;
check: ordered
---
