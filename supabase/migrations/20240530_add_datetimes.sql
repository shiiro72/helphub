-- Alter help_requests table
ALTER TABLE help_requests
ADD COLUMN start_datetime TIMESTAMPTZ,
ADD COLUMN end_datetime TIMESTAMPTZ;

-- Alter help_offers table
ALTER TABLE help_offers
ADD COLUMN start_datetime TIMESTAMPTZ,
ADD COLUMN end_datetime TIMESTAMPTZ;
