---
section: 8.3
kind: dml
title: Delete the obsolete stock lines
marks: 2
difficulty: basic
source: 原创 · 考纲 8.3 补全（DELETE + 字符串条件）
coverage: DELETE FROM, WHERE
schema: |
  STOCK(ItemID, Category, Quantity)
prompt: |
  Everything in the **obsolete** category is being removed from the stock table. Write
  the statement that deletes those rows and nothing else.
seed: |
  CREATE TABLE Stock (
    ItemID INTEGER PRIMARY KEY,
    Category VARCHAR(20),
    Quantity INTEGER
  );
  INSERT INTO Stock VALUES
    (1, 'obsolete', 3),
    (2, 'hardware', 12),
    (3, 'obsolete', 0),
    (4, 'stationery', 40);
answer: |
  DELETE FROM Stock
  WHERE Category = 'obsolete';
wrong: |
  DELETE FROM Stock
  WHERE Category = 'hardware';
check: table
checktable: Stock
---
