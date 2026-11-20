---
section: 8.3
kind: dml
title: Quotes cheapest first
marks: 3
difficulty: advanced
source: 原创 · 考纲 8.3 补全（ORDER BY 数字升序）
coverage: SELECT, ORDER BY
schema: |
  QUOTE(QuoteID, Supplier, Price)
prompt: |
  Return each **Supplier** and their **Price**, cheapest first.
seed: |
  CREATE TABLE Quote (
    QuoteID INTEGER PRIMARY KEY,
    Supplier VARCHAR(30),
    Price REAL
  );
  INSERT INTO Quote VALUES
    (1, 'Northline', 120.00),
    (2, 'Harbour', 95.50),
    (3, 'Kestrel', 143.25);
answer: |
  SELECT Supplier, Price
  FROM Quote
  ORDER BY Price ASC;
wrong: |
  SELECT Supplier, Price
  FROM Quote
  ORDER BY Price DESC;
check: ordered
---
