-- Fix infinite recursion in messages RLS update policy

DROP POLICY IF EXISTS "Participants can update message read status." ON messages;

CREATE POLICY "Participants can update message read status." ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        participant_1 = auth.uid() OR
        participant_2 = auth.uid() OR
        public.is_member_of_conversation(conversations.id)
      )
    )
  )
  WITH CHECK (
    -- Only allow updating the is_read column by the recipient (not the sender)
    auth.uid() <> sender_id
  );
