---
section: 8.3
kind: dml
title: Staff count per department, alphabetically
marks: 3
difficulty: advanced
source: 原创 · 考纲 8.3 补全（GROUP BY + ORDER BY）
coverage: SELECT, COUNT, GROUP BY, ORDER BY
schema: |
  STAFF(StaffID, Name, Department)
prompt: |
  Return each **Department** and the **number of staff** in it, listing the departments
  in alphabetical order.
seed: |
  CREATE TABLE Staff (
    StaffID INTEGER PRIMARY KEY,
    Name VARCHAR(30),
    Department VARCHAR(30)
  );
  INSERT INTO Staff VALUES
    (1, 'Ada', 'Science'),
    (2, 'Bo', 'English'),
    (3, 'Chen', 'Science'),
    (4, 'Dara', 'Maths'),
    (5, 'Eli', 'English');
answer: |
  SELECT Department, COUNT(StaffID)
  FROM Staff
  GROUP BY Department
  ORDER BY Department ASC;
wrong: |
  SELECT Department, COUNT(StaffID)
  FROM Staff
  GROUP BY Department
  ORDER BY Department DESC;
check: ordered
---
