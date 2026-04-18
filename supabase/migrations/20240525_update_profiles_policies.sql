-- Add UPDATE and DELETE policies to profiles
CREATE POLICY "Users can update their own profiles." ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profiles." ON profiles
  FOR DELETE USING (auth.uid() = id);
