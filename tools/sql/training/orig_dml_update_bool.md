---
section: 8.3
kind: dml
title: Mark one ticket as collected
marks: 2
difficulty: basic
source: 原创 · 考纲 8.3 补全（UPDATE + BOOLEAN）
coverage: UPDATE, WHERE
schema: |
  TICKET(TicketID, Event, Collected)
prompt: |
  Ticket **12** has been collected. Write the statement that records this, leaving every
  other ticket unchanged.
seed: |
  CREATE TABLE Ticket (
    TicketID INTEGER PRIMARY KEY,
    Event VARCHAR(40),
    Collected BOOLEAN
  );
  INSERT INTO Ticket VALUES
    (11, 'Evening talk', FALSE),
    (12, 'Evening talk', FALSE),
    (13, 'Morning tour', FALSE);
answer: |
  UPDATE Ticket
  SET Collected = TRUE
  WHERE TicketID = 12;
wrong: |
  UPDATE Ticket
  SET Collected = TRUE;
check: table
checktable: Ticket
---
