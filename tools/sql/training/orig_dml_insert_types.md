---
section: 8.3
kind: dml
title: Record a visit with every data type
marks: 3
difficulty: advanced
source: 原创 · 考纲 8.3 补全（INSERT + 多类型值）
coverage: INSERT INTO
schema: |
  VISIT(VisitID, VisitorCode, Arrived, EntryTime, Fee, Paid)
prompt: |
  Add visit **5** to the Visit table: visitor code **ABC**, arrived **2 March 2026** at
  **09:15**, fee **4.50**, already **paid**.
seed: |
  CREATE TABLE Visit (
    VisitID INTEGER PRIMARY KEY,
    VisitorCode CHARACTER(3),
    Arrived DATE,
    EntryTime TIME,
    Fee REAL,
    Paid BOOLEAN
  );
  INSERT INTO Visit VALUES (1, 'XYZ', '2026-03-01', '10:00', 4.50, TRUE);
answer: |
  INSERT INTO Visit
  VALUES (5, 'ABC', '2026-03-02', '09:15', 4.50, TRUE);
wrong: |
  INSERT INTO Visit
  VALUES (5, 'ABC', '2026-03-02', '09:15', 4.50, FALSE);
check: table
checktable: Visit
---
