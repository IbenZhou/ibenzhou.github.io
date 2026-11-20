---
section: 8.3
kind: dml
title: Log a sensor reading that is switched off
marks: 3
difficulty: basic
source: 原创 · 考纲 8.3 补全（INSERT + BOOLEAN 值）
coverage: INSERT INTO
schema: |
  SENSOR(SensorID, SiteCode, Active, Reading, Installed)
prompt: |
  Add sensor **4**: site code **AB**, **not** currently active, reading **21.5**, installed
  on **2 May 2026**.
seed: |
  CREATE TABLE Sensor (
    SensorID INTEGER PRIMARY KEY,
    SiteCode CHARACTER(2),
    Active BOOLEAN,
    Reading REAL,
    Installed DATE
  );
  INSERT INTO Sensor VALUES
    (1, 'AA', TRUE, 19.0, '2026-01-10'),
    (2, 'AB', TRUE, 20.5, '2026-01-11'),
    (3, 'AC', FALSE, 18.0, '2026-02-02');
answer: |
  INSERT INTO Sensor
  VALUES (4, 'AB', FALSE, 21.5, '2026-05-02');
wrong: |
  INSERT INTO Sensor
  VALUES (4, 'AB', TRUE, 21.5, '2026-05-02');
check: table
checktable: Sensor
---
