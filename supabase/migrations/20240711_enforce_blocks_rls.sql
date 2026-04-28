-- Strengthen blocking enforcement via RLS

-- 1. Function to check if a block exists between two users
CREATE OR REPLACE FUNCTION public.is_blocked(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.blocks
    WHERE (blocker_id = user_a AND blocked_id = user_b)
    OR (blocker_id = user_b AND blocked_id = user_a)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Update messages INSERT policy to strictly prevent messaging blocked users
DROP POLICY IF EXISTS "Participants can insert messages." ON messages;
CREATE POLICY "Participants can insert messages." ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        -- For direct chats, ensure no block exists
        (
          is_group = false AND
          (
            (auth.uid() = participant_1 AND NOT public.is_blocked(participant_1, participant_2)) OR
            (auth.uid() = participant_2 AND NOT public.is_blocked(participant_2, participant_1))
          )
        ) OR
        -- For group chats, rely on membership
        (is_group = true AND public.is_member_of_conversation(conversations.id))
      )
    )
  );

-- 3. Update messages SELECT policy to hide messages from blocked users
DROP POLICY IF EXISTS "Participants can view messages." ON messages;
CREATE POLICY "Participants can view messages." ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        participant_1 = auth.uid() OR
        participant_2 = auth.uid() OR
        public.is_member_of_conversation(conversations.id)
      )
    ) AND
    NOT public.is_blocked(auth.uid(), sender_id)
  );
