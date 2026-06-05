ALTER TABLE reservations
    ADD COLUMN IF NOT EXISTS end_time TIMESTAMP;

UPDATE reservations
SET end_time = COALESCE(end_time, reservation_time + INTERVAL '2 hours')
WHERE end_time IS NULL;

ALTER TABLE reservations
    ALTER COLUMN end_time SET NOT NULL;
