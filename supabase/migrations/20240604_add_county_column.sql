-- Alter help_requests table
ALTER TABLE help_requests
ADD COLUMN county TEXT;

-- Alter help_offers table
ALTER TABLE help_offers
ADD COLUMN county TEXT;
