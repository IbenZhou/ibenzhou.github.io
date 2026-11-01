---
section: 8.3
kind: ddl
title: Create the database
marks: 2
coverage: CREATE DATABASE
prompt: |
  The reading club at Ridgeway High has no database yet. Write **one** SQL statement
  that creates a new database named LIBRARY, which will hold the club's records.
answer: |
  CREATE DATABASE library;
check: catalog
expectname: library
wrong: |
  CREATE DATABASE LIBRY;
---
