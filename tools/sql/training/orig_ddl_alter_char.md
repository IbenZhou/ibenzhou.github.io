---
section: 8.3
kind: ddl
title: Add a fixed-length course code
marks: 2
difficulty: basic
source: 原创 · 考纲 8.3 补全（CHARACTER）
coverage: ALTER TABLE, CHARACTER
schema: |
  COURSE(CourseID, Title)
prompt: |
  Every course needs a short code of **exactly 3 characters**. Using ALTER TABLE,
  add one field called **Code** to Course.
seed: |
  CREATE TABLE Course (
    CourseID INTEGER PRIMARY KEY,
    Title VARCHAR(40)
  );
answer: |
  ALTER TABLE Course ADD COLUMN Code CHARACTER(3);
wrong: |
  ALTER TABLE Course ADD COLUMN Code VARCHAR(3);
check: schema
checktable: Course
---
