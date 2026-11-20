---
section: 8.3
kind: ddl
title: Record when a shift starts
marks: 2
difficulty: basic
source: 原创 · 考纲 8.3 补全（TIME）
coverage: ALTER TABLE, TIME
schema: |
  SHIFT(ShiftID, PersonName)
prompt: |
  The rota needs the time each shift begins. Using ALTER TABLE, add one field called
  **StartTime** to Shift that stores a time of day.
seed: |
  CREATE TABLE Shift (
    ShiftID INTEGER PRIMARY KEY,
    PersonName VARCHAR(30)
  );
answer: |
  ALTER TABLE Shift ADD COLUMN StartTime TIME;
wrong: |
  ALTER TABLE Shift ADD COLUMN StartTime VARCHAR(8);
check: schema
checktable: Shift
---
