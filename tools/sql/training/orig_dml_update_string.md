---
section: 8.3
kind: dml
title: Rename one course
marks: 2
difficulty: basic
source: 原创 · 考纲 8.3 补全（UPDATE + 字符串条件）
coverage: UPDATE, WHERE
schema: |
  COURSE(CourseID, Code, Title)
prompt: |
  The course with code **SQL2** is now called **Advanced SQL**. Write the statement that
  changes its title and nothing else.
seed: |
  CREATE TABLE Course (
    CourseID INTEGER PRIMARY KEY,
    Code CHARACTER(4),
    Title VARCHAR(40)
  );
  INSERT INTO Course VALUES
    (1, 'SQL1', 'Introduction to SQL'),
    (2, 'SQL2', 'SQL in Practice'),
    (3, 'DBS1', 'Database Design');
answer: |
  UPDATE Course
  SET Title = 'Advanced SQL'
  WHERE Code = 'SQL2';
wrong: |
  UPDATE Course
  SET Title = 'Advanced SQL';
check: table
checktable: Course
---
