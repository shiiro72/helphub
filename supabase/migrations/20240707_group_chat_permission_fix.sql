-- Allow users to add others to conversation_members if they are members themselves
-- This enables direct group chat creation by the owner

DROP POLICY IF EXISTS "Users can be added to conversations." ON conversation_members;

CREATE POLICY "Users can be added to conversations." ON conversation_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    public.is_member_of_conversation(conversation_id) OR
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );
