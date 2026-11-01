---
section: 8.3
kind: ddl
title: Add a new field
marks: 2
coverage: ALTER TABLE, BOOLEAN
schema: |
  BOOK(ISBN, Title, Pages)
prompt: |
  The club now needs to record whether each book is physically on the shelf.
  Write an SQL script that adds a new attribute named **OnShelf** to the existing
  **Book** table. It must store a yes / no value.
seed: |
  CREATE TABLE Book (
    ISBN VARCHAR(13) PRIMARY KEY,
    Title VARCHAR(60),
    Pages INTEGER
  );
answer: |
  ALTER TABLE Book ADD COLUMN OnShelf BOOLEAN;
check: schema
checktable: Book
wrong: |
  ALTER TABLE Book ADD COLUMN OnShelf VARCHAR(5);
---
