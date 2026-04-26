-- Ensure is_member_of_conversation is defined and robust
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

-- Create a security definer function to check conversation participation without RLS interference
-- This is used to verify that the person adding members is the creator (participant_1) or a participant
CREATE OR REPLACE FUNCTION public.is_participant_of_conversation(conv_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = conv_id
    AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update conversation_members policies
DROP POLICY IF EXISTS "Users can be added to conversations." ON conversation_members;
CREATE POLICY "Users can be added to conversations." ON conversation_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    public.is_member_of_conversation(conversation_id) OR
    public.is_participant_of_conversation(conversation_id)
  );

DROP POLICY IF EXISTS "Members can view co-members." ON conversation_members;
CREATE POLICY "Members can view co-members." ON conversation_members
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

-- Update conversations SELECT policy to allow members to view the conversation
-- This ensures that volunteers added to a group chat can see the conversation record
DROP POLICY IF EXISTS "Users can view their own conversations." ON conversations;
CREATE POLICY "Users can view their own conversations." ON conversations
  FOR SELECT USING (
    auth.uid() = participant_1 OR
    auth.uid() = participant_2 OR
    public.is_member_of_conversation(id)
  );
