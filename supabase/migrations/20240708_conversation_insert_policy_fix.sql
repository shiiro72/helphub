-- Allow users to create group conversations if authenticated

DROP POLICY IF EXISTS "Users can create conversations." ON conversations;

CREATE POLICY "Users can create conversations." ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() = participant_1 OR
    auth.uid() = participant_2 OR
    (is_group = true AND auth.uid() IS NOT NULL)
  );
