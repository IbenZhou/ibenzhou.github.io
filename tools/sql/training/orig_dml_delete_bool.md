---
section: 8.3
kind: dml
title: Remove the finished jobs
marks: 2
difficulty: basic
source: 原创 · 考纲 8.3 补全（DELETE + BOOLEAN）
coverage: DELETE FROM, WHERE
schema: |
  JOB(JobID, Title, Done)
prompt: |
  Completed jobs are cleared from the board at the end of each day. Write the statement
  that deletes **only** the jobs that are done.
seed: |
  CREATE TABLE Job (
    JobID INTEGER PRIMARY KEY,
    Title VARCHAR(40),
    Done BOOLEAN
  );
  INSERT INTO Job VALUES
    (1, 'Replace filter', TRUE),
    (2, 'Order bulbs', FALSE),
    (3, 'Service lift', TRUE);
answer: |
  DELETE FROM Job
  WHERE Done = TRUE;
wrong: |
  DELETE FROM Job
  WHERE Done = FALSE;
check: table
checktable: Job
---
