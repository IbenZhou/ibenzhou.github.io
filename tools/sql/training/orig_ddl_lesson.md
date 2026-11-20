---
section: 8.3
kind: ddl
title: Create the lesson table with times and a fee
marks: 6
difficulty: advanced
source: 原创 · 考纲 8.3 补全（CHARACTER / TIME / REAL）
coverage: CREATE TABLE, PRIMARY KEY, INTEGER, CHARACTER, TIME, REAL
prompt: |
  A music school schedules lessons in rooms. Create the table **Lesson** with:
  LessonID (a whole number, the primary key), RoomCode (**exactly 4 characters**),
  StartTime and EndTime (both times of day), and Fee (a number that may have
  decimals).
answer: |
  CREATE TABLE Lesson (
    LessonID INTEGER PRIMARY KEY,
    RoomCode CHARACTER(4),
    StartTime TIME,
    EndTime TIME,
    Fee REAL
  );
wrong: |
  CREATE TABLE Lesson (
    LessonID INTEGER PRIMARY KEY,
    RoomCode VARCHAR(4),
    StartTime VARCHAR(8),
    EndTime VARCHAR(8),
    Fee INTEGER
  );
check: schema
checktable: Lesson
---
