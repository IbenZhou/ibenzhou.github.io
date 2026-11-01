---
section: 8.3
kind: ddl
title: Create a table with a foreign key
marks: 4
coverage: CREATE TABLE, FOREIGN KEY, REFERENCES, INTEGER, VARCHAR
schema: |
  MEMBER(MemberID, FullName)
prompt: |
  Create the table **Copy** to record the physical copies the club owns. It must hold
  CopyID (whole number), ISBN (up to 13 characters) and MemberID (whole number).
  MemberID must be a **foreign key** referencing MemberID in the Member table,
  declared inside the CREATE TABLE statement.
seed: |
  CREATE TABLE Member (
    MemberID INTEGER PRIMARY KEY,
    FullName VARCHAR(40)
  );
answer: |
  CREATE TABLE Copy (
    CopyID INTEGER,
    ISBN VARCHAR(13),
    MemberID INTEGER,
    FOREIGN KEY (MemberID) REFERENCES Member(MemberID)
  );
check: schema
checktable: Copy
wrong: |
  CREATE TABLE Copy (
    CopyID INTEGER,
    ISBN VARCHAR(13),
    MemberID INTEGER REFERENCES Copy(CopyID)
  );
---
