---
section: 8.3
kind: dml
title: Average lesson fee per tutor
marks: 4
difficulty: challenge
source: 原创 · 考纲 8.3 补全（INNER JOIN + AVG + GROUP BY）
coverage: SELECT, AVG, INNER JOIN, GROUP BY
schema: |
  TUTOR(TutorID, Name)
  LESSON(LessonID, TutorID, Fee)
prompt: |
  Return each tutor's **name** and the **average fee** of the lessons they teach.
seed: |
  CREATE TABLE Tutor (
    TutorID INTEGER PRIMARY KEY,
    Name VARCHAR(30)
  );
  CREATE TABLE Lesson (
    LessonID INTEGER PRIMARY KEY,
    TutorID INTEGER REFERENCES Tutor(TutorID),
    Fee REAL
  );
  INSERT INTO Tutor VALUES (1, 'Ada'), (2, 'Bo'), (3, 'Chen');
  INSERT INTO Lesson VALUES
    (1, 1, 20.00),
    (2, 1, 40.00),
    (3, 2, 30.00),
    (4, 3, 50.00);
answer: |
  SELECT Tutor.Name, AVG(Lesson.Fee)
  FROM Tutor
  INNER JOIN Lesson ON Tutor.TutorID = Lesson.TutorID
  GROUP BY Tutor.TutorID, Tutor.Name;
wrong: |
  SELECT Tutor.Name, SUM(Lesson.Fee)
  FROM Tutor
  INNER JOIN Lesson ON Tutor.TutorID = Lesson.TutorID
  GROUP BY Tutor.TutorID, Tutor.Name;
check: rows
---
