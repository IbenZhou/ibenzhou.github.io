---
section: 8.3
kind: dml
title: Remove inactive enrolments on one course
marks: 3
difficulty: basic
source: 原创 · 考纲 8.3 补全（DELETE + 两个条件）
coverage: DELETE FROM, WHERE
schema: |
  ENROLMENT(EnrolID, StudentID, Course, Active)
prompt: |
  Enrolments on **MATH1** that are no longer active are being archived. Write the
  statement that deletes **only** those rows.
seed: |
  CREATE TABLE Enrolment (
    EnrolID INTEGER PRIMARY KEY,
    StudentID INTEGER,
    Course VARCHAR(10),
    Active BOOLEAN
  );
  INSERT INTO Enrolment VALUES
    (1, 101, 'MATH1', FALSE),
    (2, 102, 'MATH1', TRUE),
    (3, 103, 'PHYS1', FALSE),
    (4, 104, 'MATH1', FALSE);
answer: |
  DELETE FROM Enrolment
  WHERE Course = 'MATH1' AND Active = FALSE;
wrong: |
  DELETE FROM Enrolment
  WHERE Course = 'MATH1';
check: table
checktable: Enrolment
---
