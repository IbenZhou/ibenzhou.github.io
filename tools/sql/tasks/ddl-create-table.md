---
section: 8.3
kind: ddl
title: Create the Member table
marks: 7
coverage: CREATE TABLE, PRIMARY KEY, INTEGER, VARCHAR, CHARACTER, BOOLEAN, REAL, DATE, TIME
prompt: |
  Create the table **Member** for the club database. It must store, in this order:
  - MemberID — a whole number that identifies each member (the primary key)
  - FullName — text, up to 40 characters
  - Code — exactly 3 characters
  - OnLoan — yes / no
  - Fine — a number that may have decimal digits
  - DateJoined — a date
  - OpenTime — a time
answer: |
  CREATE TABLE Member (
    MemberID INTEGER PRIMARY KEY,
    FullName VARCHAR(40),
    Code CHARACTER(3),
    OnLoan BOOLEAN,
    Fine REAL,
    DateJoined DATE,
    OpenTime TIME
  );
check: schema
checktable: Member
wrong: |
  CREATE TABLE Member (
    MemberID INTEGER,
    FullName TEXT,
    Code CHARACTER(3),
    OnLoan BOOLEAN,
    Fine REAL,
    DateJoined DATE
  );
---
