---
section: 8.3
kind: ddl
title: Create a database and its first table
marks: 7
difficulty: challenge
source: 原创 · 考纲 8.3 补全（CREATE DATABASE + 类型）
coverage: CREATE DATABASE, CREATE TABLE, PRIMARY KEY, INTEGER, CHARACTER, TIME, REAL
prompt: |
  A ticket office starts from an empty server. Write a script that:
  1. creates a database named **TicketOffice**
  2. creates the table **Event** in it, with EventID (a whole number, the primary key),
     VenueCode (**exactly 2 characters**), StartTime (a time) and Price (a number that
     may have decimals).
seed: |
  SELECT 1;
answer: |
  CREATE DATABASE ticketoffice;
  CREATE TABLE Event (
    EventID INTEGER PRIMARY KEY,
    VenueCode CHARACTER(2),
    StartTime TIME,
    Price REAL
  );
wrong: |
  CREATE TABLE Event (
    EventID INTEGER PRIMARY KEY,
    VenueCode VARCHAR(2),
    StartTime TIME,
    Price REAL
  );
check: schema
checktable: Event
---
