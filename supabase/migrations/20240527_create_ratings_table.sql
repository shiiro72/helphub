-- 1. Create Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rater_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rated_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[] DEFAULT '{}',
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_rating UNIQUE (rater_id, rated_id),
  CONSTRAINT rater_rated_different CHECK (rater_id <> rated_id)
);

-- 2. Add trust_rank and total_ratings to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_rank NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;

-- 3. Set up Row Level Security (RLS)
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Ratings
CREATE POLICY "Ratings are viewable by everyone." ON ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can rate others they have talked to." ON ratings
  FOR INSERT WITH CHECK (
    auth.uid() = rater_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE (participant_1 = rater_id AND participant_2 = rated_id)
         OR (participant_1 = rated_id AND participant_2 = rater_id)
    )
  );

CREATE POLICY "Users can update their own ratings." ON ratings
  FOR UPDATE USING (auth.uid() = rater_id);

CREATE POLICY "Users can delete their own ratings." ON ratings
  FOR DELETE USING (auth.uid() = rater_id);

-- 5. Trigger function to update profile trust_rank
CREATE OR REPLACE FUNCTION update_profile_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    UPDATE profiles
    SET
      trust_rank = (SELECT COALESCE(AVG(rating), 0) FROM ratings WHERE rated_id = NEW.rated_id),
      total_ratings = (SELECT COUNT(*) FROM ratings WHERE rated_id = NEW.rated_id)
    WHERE id = NEW.rated_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE profiles
    SET
      trust_rank = (SELECT COALESCE(AVG(rating), 0) FROM ratings WHERE rated_id = OLD.rated_id),
      total_ratings = (SELECT COUNT(*) FROM ratings WHERE rated_id = OLD.rated_id)
    WHERE id = OLD.rated_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profile_rating_stats
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_profile_rating_stats();
