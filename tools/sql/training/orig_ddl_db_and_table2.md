---
section: 8.3
kind: ddl
title: Build the reading room schema
marks: 7
difficulty: challenge
source: 原创 · 考纲 8.3 补全（CREATE DATABASE + DATE/TIME）
coverage: CREATE DATABASE, CREATE TABLE, PRIMARY KEY, INTEGER, CHARACTER, REAL, DATE, TIME
prompt: |
  A reading room needs its own database. Write a script that:
  1. creates a database named **ReadingRoom**
  2. creates the table **BookCopy** with CopyID (a whole number, the primary key),
     ShelfCode (**exactly 3 characters**), ReplacementCost (a number that may have
     decimals), Added (a date) and LastIssued (a time).
seed: |
  SELECT 1;
answer: |
  CREATE DATABASE readingroom;
  CREATE TABLE BookCopy (
    CopyID INTEGER PRIMARY KEY,
    ShelfCode CHARACTER(3),
    ReplacementCost REAL,
    Added DATE,
    LastIssued TIME
  );
wrong: |
  CREATE TABLE BookCopy (
    CopyID INTEGER PRIMARY KEY,
    ShelfCode CHARACTER(3),
    ReplacementCost REAL,
    Added DATE
  );
check: schema
checktable: BookCopy
---
