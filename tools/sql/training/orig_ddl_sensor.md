---
section: 8.3
kind: ddl
title: Create a sensor log table
marks: 6
difficulty: advanced
source: 原创 · 考纲 8.3 补全（BOOLEAN / REAL / DATE）
coverage: CREATE TABLE, PRIMARY KEY, INTEGER, CHARACTER, BOOLEAN, REAL, DATE
prompt: |
  A weather station logs its sensors. Create the table **Sensor** with: SensorID
  (a whole number, the primary key), SiteCode (**exactly 2 characters**), Active
  (yes / no), Reading (a number that may have decimals) and Installed (a date).
answer: |
  CREATE TABLE Sensor (
    SensorID INTEGER PRIMARY KEY,
    SiteCode CHARACTER(2),
    Active BOOLEAN,
    Reading REAL,
    Installed DATE
  );
wrong: |
  CREATE TABLE Sensor (
    SensorID INTEGER,
    SiteCode VARCHAR(2),
    Active INTEGER,
    Reading REAL,
    Installed DATE
  );
check: schema
checktable: Sensor
---
