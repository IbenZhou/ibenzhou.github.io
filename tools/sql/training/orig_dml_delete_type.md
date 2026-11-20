---
section: 8.3
kind: dml
title: Delete the pinned notes
marks: 2
difficulty: basic
source: 原创 · 考纲 8.3 补全（DELETE + BOOLEAN）
coverage: DELETE FROM, WHERE
schema: |
  NOTE(NoteID, Text, Pinned)
prompt: |
  The board is being cleared of pinned notes only. Write the statement that deletes every
  note whose **Pinned** value is true.
seed: |
  CREATE TABLE Note (
    NoteID INTEGER PRIMARY KEY,
    Text VARCHAR(60),
    Pinned BOOLEAN
  );
  INSERT INTO Note VALUES
    (1, 'Order more pens', TRUE),
    (2, 'Meeting moved', FALSE),
    (3, 'Check projector', TRUE),
    (4, 'Lunch rota', FALSE);
answer: |
  DELETE FROM Note
  WHERE Pinned = TRUE;
wrong: |
  DELETE FROM Note
  WHERE Pinned = FALSE;
check: table
checktable: Note
---
