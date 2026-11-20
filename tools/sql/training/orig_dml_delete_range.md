---
section: 8.3
kind: dml
title: Delete one month of bookings
marks: 3
difficulty: advanced
source: 原创 · 考纲 8.3 补全（DELETE + 日期范围）
coverage: DELETE FROM, WHERE
schema: |
  BOOKING(BookingID, Date, Room)
prompt: |
  The September 2025 bookings have been moved to another system. Write the statement that
  deletes only the bookings whose date falls in **September 2025**.
seed: |
  CREATE TABLE Booking (
    BookingID INTEGER PRIMARY KEY,
    Date DATE,
    Room VARCHAR(10)
  );
  INSERT INTO Booking VALUES
    (1, '2025-08-29', 'R1'),
    (2, '2025-09-01', 'R1'),
    (3, '2025-09-30', 'R2'),
    (4, '2025-10-02', 'R2');
answer: |
  DELETE FROM Booking
  WHERE Date >= '2025-09-01' AND Date <= '2025-09-30';
wrong: |
  DELETE FROM Booking
  WHERE Date >= '2025-09-01';
check: table
checktable: Booking
---
