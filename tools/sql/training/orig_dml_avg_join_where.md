---
section: 8.3
kind: dml
title: Average price of accepted UK quotes
marks: 4
difficulty: challenge
source: 原创 · 考纲 8.3 补全（AVG + JOIN + WHERE）
coverage: SELECT, AVG, INNER JOIN, WHERE
schema: |
  SUPPLIER(SupplierID, SupplierName, Country)
  QUOTE(QuoteID, SupplierID, Price, Accepted)
prompt: |
  Return the **average price** of the quotes that were **accepted** from suppliers based
  in the **UK**.
seed: |
  CREATE TABLE Supplier (
    SupplierID INTEGER PRIMARY KEY,
    SupplierName VARCHAR(30),
    Country VARCHAR(20)
  );
  CREATE TABLE Quote (
    QuoteID INTEGER PRIMARY KEY,
    SupplierID INTEGER REFERENCES Supplier(SupplierID),
    Price REAL,
    Accepted BOOLEAN
  );
  INSERT INTO Supplier VALUES
    (1, 'Northline', 'UK'),
    (2, 'Harbour', 'UK'),
    (3, 'Kestrel', 'France');
  INSERT INTO Quote VALUES
    (10, 1, 100.00, TRUE),
    (11, 2, 140.00, TRUE),
    (12, 2, 200.00, FALSE),
    (13, 3, 90.00, TRUE);
answer: |
  SELECT AVG(Quote.Price)
  FROM Quote
  INNER JOIN Supplier ON Quote.SupplierID = Supplier.SupplierID
  WHERE Supplier.Country = 'UK' AND Quote.Accepted = TRUE;
wrong: |
  SELECT AVG(Quote.Price)
  FROM Quote
  INNER JOIN Supplier ON Quote.SupplierID = Supplier.SupplierID
  WHERE Supplier.Country = 'UK';
check: rows
---
