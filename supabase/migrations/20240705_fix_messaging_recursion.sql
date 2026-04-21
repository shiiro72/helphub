-- Fix infinite recursion in conversation_members RLS policy

-- 1. Create a security definer function to check membership without triggering RLS
CREATE OR REPLACE FUNCTION public.is_member_of_conversation(conv_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = conv_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Update conversation_members policies
DROP POLICY IF EXISTS "Members can view co-members." ON conversation_members;

CREATE POLICY "Members can view co-members." ON conversation_members
  FOR SELECT USING (
    public.is_member_of_conversation(conversation_id)
  );

-- 3. Update conversations policies to use the function
DROP POLICY IF EXISTS "Users can view their own conversations." ON conversations;

CREATE POLICY "Users can view their own conversations." ON conversations
  FOR SELECT USING (
    auth.uid() = participant_1 OR
    auth.uid() = participant_2 OR
    public.is_member_of_conversation(id)
  );

-- 4. Update messages policies to use the function
DROP POLICY IF EXISTS "Participants can view messages in their conversations." ON messages;

CREATE POLICY "Participants can view messages in their conversations." ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        auth.uid() = conversations.participant_1 OR
        auth.uid() = conversations.participant_2 OR
        public.is_member_of_conversation(conversations.id)
      )
    )
  );

DROP POLICY IF EXISTS "Participants can insert messages in their conversations." ON messages;

CREATE POLICY "Participants can insert messages in their conversations." ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (
        auth.uid() = conversations.participant_1 OR
        auth.uid() = conversations.participant_2 OR
        public.is_member_of_conversation(conversations.id)
      )
    )
  );
