---
section: 8.3
kind: ddl
title: Flag a machine as armed
marks: 2
difficulty: basic
source: 原创 · 考纲 8.3 补全（ALTER + BOOLEAN）
coverage: ALTER TABLE, BOOLEAN
schema: |
  ROBOT(RobotID, Model)
prompt: |
  The workshop robots now have an arming state. Using ALTER TABLE, add one field called
  **Armed** to Robot that stores a yes / no value.
seed: |
  CREATE TABLE Robot (
    RobotID INTEGER PRIMARY KEY,
    Model VARCHAR(20)
  );
answer: |
  ALTER TABLE Robot ADD COLUMN Armed BOOLEAN;
wrong: |
  ALTER TABLE Robot ADD COLUMN Armed INTEGER;
check: schema
checktable: Robot
---
