---
section: 8.3
kind: ddl
title: Add a decimal discount field
marks: 2
difficulty: basic
source: 原创 · 考纲 8.3 补全（REAL）
coverage: ALTER TABLE, REAL
schema: |
  PRODUCT(ProductID, Name, Price)
prompt: |
  The shop is introducing percentage discounts. Using ALTER TABLE, add one field called
  **Discount** to Product that can store a number with decimals.
seed: |
  CREATE TABLE Product (
    ProductID INTEGER PRIMARY KEY,
    Name VARCHAR(40),
    Price REAL
  );
answer: |
  ALTER TABLE Product ADD COLUMN Discount REAL;
wrong: |
  ALTER TABLE Product ADD COLUMN Discount INTEGER;
check: schema
checktable: Product
---
