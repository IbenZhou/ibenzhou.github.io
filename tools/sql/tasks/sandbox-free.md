---
section: 8.3
kind: sandbox
title: Free sandbox
marks: 0
prompt: |
  An open database to experiment in. Run does **not** reset this one, so anything you
  create stays until you press Reset. Try defining a foreign key and then inserting a
  value that breaks it, or add a column and look at the structure that results.
seed: |
  CREATE TABLE Student (
    StudentID INTEGER PRIMARY KEY,
    FullName VARCHAR(40),
    Email VARCHAR(60),
    Enrolled BOOLEAN,
    DOB DATE,
    StartTime TIME
  );
  CREATE TABLE Mark (
    MarkID INTEGER PRIMARY KEY,
    StudentID INTEGER REFERENCES Student(StudentID),
    Subject VARCHAR(30),
    Score REAL,
    Graded BOOLEAN
  );
  INSERT INTO Student VALUES
    (1, 'Amara Osei', 'amara@ridgeway.example', TRUE, '2007-03-14', '08:30'),
    (2, 'Kofi Mensah', 'kofi@ridgeway.example', FALSE, '2006-11-02', '09:15'),
    (3, 'Lan Chen', 'lan@ridgeway.example', TRUE, '2007-07-21', '08:30');
  INSERT INTO Mark VALUES
    (1, 1, 'Algorithms', 78, TRUE),
    (2, 1, 'Networks', 64, TRUE),
    (3, 2, 'Networks', 55, FALSE),
    (4, 3, 'Databases', 91, TRUE),
    (5, 2, 'Databases', 72, TRUE),
    (6, 3, 'Algorithms', 68, FALSE);
starter: |
  SELECT FullName, Email
  FROM Student;
check: rows
---
