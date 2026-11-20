---
section: 8.3
kind: dml
title: Average fee per room
marks: 3
difficulty: advanced
source: 原创 · 考纲 8.3 补全（AVG + GROUP BY）
coverage: SELECT, AVG, GROUP BY
schema: |
  LESSON(LessonID, RoomCode, Fee)
prompt: |
  Return each **RoomCode** together with the **average fee** of the lessons taught in
  that room.
seed: |
  CREATE TABLE Lesson (
    LessonID INTEGER PRIMARY KEY,
    RoomCode CHARACTER(4),
    Fee REAL
  );
  INSERT INTO Lesson VALUES
    (1, 'R101', 20.00),
    (2, 'R101', 30.00),
    (3, 'R205', 45.00),
    (4, 'R205', 25.00),
    (5, 'R205', 35.00);
answer: |
  SELECT RoomCode, AVG(Fee)
  FROM Lesson
  GROUP BY RoomCode;
wrong: |
  SELECT RoomCode, AVG(Fee)
  FROM Lesson;
check: rows
---
