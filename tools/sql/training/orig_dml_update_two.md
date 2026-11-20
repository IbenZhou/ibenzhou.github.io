---
section: 8.3
kind: dml
title: Move a member of staff and change their mode
marks: 3
difficulty: basic
source: 原创 · 考纲 8.3 补全（UPDATE 多字段）
coverage: UPDATE, WHERE
schema: |
  STAFF(StaffID, Name, Department, Remote)
prompt: |
  Staff member **3** is moving to the **Science** department and will now work remotely.
  Write one statement that changes both facts for that member only.
seed: |
  CREATE TABLE Staff (
    StaffID INTEGER PRIMARY KEY,
    Name VARCHAR(30),
    Department VARCHAR(30),
    Remote BOOLEAN
  );
  INSERT INTO Staff VALUES
    (1, 'Ada', 'English', FALSE),
    (2, 'Bo', 'Science', FALSE),
    (3, 'Chen', 'English', FALSE);
answer: |
  UPDATE Staff
  SET Department = 'Science', Remote = TRUE
  WHERE StaffID = 3;
wrong: |
  UPDATE Staff
  SET Department = 'Science'
  WHERE StaffID = 3;
check: table
checktable: Staff
---
