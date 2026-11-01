---
section: 8.3
kind: ddl
title: Add a foreign key to an existing table
marks: 3
coverage: ALTER TABLE, FOREIGN KEY, REFERENCES
schema: |
  MEMBER(MemberID, FullName)
  COPY(CopyID, ISBN, MemberID)
prompt: |
  The Copy table already exists but places no restriction on its MemberID values, so a
  copy can be registered against a member who does not exist. Write an SQL script that
  uses **ALTER TABLE** to make Copy.MemberID a foreign key referencing Member.MemberID.
seed: |
  CREATE TABLE Member (
    MemberID INTEGER PRIMARY KEY,
    FullName VARCHAR(40)
  );
  CREATE TABLE Copy (
    CopyID INTEGER PRIMARY KEY,
    ISBN VARCHAR(13),
    MemberID INTEGER
  );
answer: |
  ALTER TABLE Copy ADD FOREIGN KEY (MemberID) REFERENCES Member(MemberID);
check: schema
checktable: Copy
wrong: |
  ALTER TABLE Copy ADD PRIMARY KEY (MemberID);
---
