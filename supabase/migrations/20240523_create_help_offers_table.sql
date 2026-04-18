-- Create the Help Offers table
CREATE TABLE IF NOT EXISTS help_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  offer_location TEXT DEFAULT NULL,
  date_posted TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE help_offers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Help offers are viewable by everyone." ON help_offers
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own help offers." ON help_offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own help offers." ON help_offers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own help offers." ON help_offers
  FOR DELETE USING (auth.uid() = user_id);
