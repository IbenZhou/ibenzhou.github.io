---
section: 8.3
kind: dml
title: Average stay for web bookings that went ahead
marks: 3
difficulty: advanced
source: 原创 · 考纲 8.3 补全（AVG + 两个条件）
coverage: SELECT, AVG, WHERE
schema: |
  BOOKING(BookingID, Channel, Nights, Cancelled)
prompt: |
  Return the **average number of nights** for bookings made through the **web** channel
  that were **not** cancelled.
seed: |
  CREATE TABLE Booking (
    BookingID INTEGER PRIMARY KEY,
    Channel VARCHAR(10),
    Nights REAL,
    Cancelled BOOLEAN
  );
  INSERT INTO Booking VALUES
    (1, 'web', 2, FALSE),
    (2, 'web', 5, FALSE),
    (3, 'web', 9, TRUE),
    (4, 'desk', 1, FALSE),
    (5, 'desk', 3, TRUE);
answer: |
  SELECT AVG(Nights)
  FROM Booking
  WHERE Channel = 'web' AND Cancelled = FALSE;
wrong: |
  SELECT AVG(Nights)
  FROM Booking
  WHERE Channel = 'web' OR Cancelled = FALSE;
check: rows
---
