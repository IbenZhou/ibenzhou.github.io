---
section: 8.3
kind: dml
title: Clear the price of unsold clearance stock
marks: 3
difficulty: advanced
source: 原创 · 考纲 8.3 补全（UPDATE + 两个条件）
coverage: UPDATE, WHERE
schema: |
  PRODUCT(ProductID, Category, Price, Stock)
prompt: |
  Every **clearance** product with **no stock left** should now be priced at **0**.
  Write one statement that does this and changes nothing else.
seed: |
  CREATE TABLE Product (
    ProductID INTEGER PRIMARY KEY,
    Category VARCHAR(20),
    Price REAL,
    Stock INTEGER
  );
  INSERT INTO Product VALUES
    (1, 'clearance', 12.00, 0),
    (2, 'clearance', 8.50, 4),
    (3, 'garden', 15.00, 0),
    (4, 'clearance', 5.00, 0);
answer: |
  UPDATE Product
  SET Price = 0
  WHERE Category = 'clearance' AND Stock = 0;
wrong: |
  UPDATE Product
  SET Price = 0
  WHERE Category = 'clearance' OR Stock = 0;
check: table
checktable: Product
---
