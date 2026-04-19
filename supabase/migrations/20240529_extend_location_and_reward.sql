-- Alter help_requests table
ALTER TABLE help_requests
ADD COLUMN city TEXT,
ADD COLUMN country TEXT,
ADD COLUMN address TEXT;

-- Alter help_offers table
ALTER TABLE help_offers
ADD COLUMN city TEXT,
ADD COLUMN country TEXT,
ADD COLUMN address TEXT,
ADD COLUMN reward_offer TEXT;
