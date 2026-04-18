-- Add UPDATE and DELETE policies to help_requests
CREATE POLICY "Users can update their own help requests." ON help_requests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own help requests." ON help_requests
  FOR DELETE USING (auth.uid() = user_id);
