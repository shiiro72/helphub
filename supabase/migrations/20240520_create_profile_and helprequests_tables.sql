-- 1. Create the Users/Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid(), 
  username TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create the Help Requests table
CREATE TABLE IF NOT EXISTS help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  reward_offer TEXT DEFAULT NULL,
  request_location TEXT DEFAULT NULL,
  date_posted TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Set up Row Level Security (RLS)
-- This ensures users can only edit their own posts
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;

-- 4. Policies (Example: Anyone can read, but only owners can insert)
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Help requests are viewable by everyone." ON help_requests
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own help requests." ON help_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);