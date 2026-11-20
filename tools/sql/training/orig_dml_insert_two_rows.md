---
section: 8.3
kind: dml
title: Add two fixtures in one statement
marks: 3
difficulty: basic
source: 原创 · 考纲 8.3 补全（INSERT 多行）
coverage: INSERT INTO
schema: |
  FIXTURE(FixtureID, HomeTeam, AwayTeam, Played)
prompt: |
  Two fixtures have been arranged. Using **one** INSERT statement, add both:
  - fixture 1: **Rovers** at home to **City**, not yet played
  - fixture 2: **Town** at home to **United**, not yet played
seed: |
  CREATE TABLE Fixture (
    FixtureID INTEGER PRIMARY KEY,
    HomeTeam VARCHAR(30),
    AwayTeam VARCHAR(30),
    Played BOOLEAN
  );
answer: |
  INSERT INTO Fixture
  VALUES (1, 'Rovers', 'City', FALSE),
         (2, 'Town', 'United', FALSE);
wrong: |
  INSERT INTO Fixture
  VALUES (1, 'Rovers', 'City', FALSE);
check: table
checktable: Fixture
---
