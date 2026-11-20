---
section: 8.3
kind: ddl
title: Create a clinic table with an open-all-hours flag
marks: 4
difficulty: advanced
source: 原创 · 考纲 8.3 补全（BOOLEAN 声明）
coverage: CREATE TABLE, PRIMARY KEY, INTEGER, VARCHAR, BOOLEAN, DATE
prompt: |
  Create the table **Clinic** with ClinicID (a whole number, the primary key), Name
  (up to 40 characters), Open24 (yes / no) and LastAudit (a date).
answer: |
  CREATE TABLE Clinic (
    ClinicID INTEGER PRIMARY KEY,
    Name VARCHAR(40),
    Open24 BOOLEAN,
    LastAudit DATE
  );
wrong: |
  CREATE TABLE Clinic (
    ClinicID INTEGER PRIMARY KEY,
    Name VARCHAR(40),
    Open24 VARCHAR(3),
    LastAudit DATE
  );
check: schema
checktable: Clinic
---
