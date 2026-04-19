-- Migration: Add volunteers and group messaging support

-- 1. Update help_requests table
ALTER TABLE help_requests ADD COLUMN max_volunteers INTEGER DEFAULT NULL;

-- 2. Create help_request_volunteers table
CREATE TABLE IF NOT EXISTS help_request_volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(request_id, user_id)
);

-- Enable RLS for help_request_volunteers
ALTER TABLE help_request_volunteers ENABLE ROW LEVEL SECURITY;

-- Policies for help_request_volunteers
CREATE POLICY "Help request volunteers are viewable by everyone." ON help_request_volunteers
  FOR SELECT USING (true);

CREATE POLICY "Users can volunteer for help requests." ON help_request_volunteers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their volunteering." ON help_request_volunteers
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Update conversations table for group support
ALTER TABLE conversations ADD COLUMN is_group BOOLEAN DEFAULT false;
ALTER TABLE conversations ADD COLUMN title TEXT;
ALTER TABLE conversations ADD COLUMN request_id UUID REFERENCES help_requests(id) ON DELETE SET NULL;

-- Relax constraints for group conversations (participant_1 and participant_2 can be null if it's a group)
ALTER TABLE conversations ALTER COLUMN participant_1 DROP NOT NULL;
ALTER TABLE conversations ALTER COLUMN participant_2 DROP NOT NULL;

-- First drop existing unique constraint
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS unique_conversation_participants;
-- Add partial unique index for 1-on-1 conversations
CREATE UNIQUE INDEX unique_1on1_conversation ON conversations (LEAST(participant_1, participant_2), GREATEST(participant_1, participant_2))
WHERE is_group = false;

-- 4. Create conversation_members table
CREATE TABLE IF NOT EXISTS conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS for conversation_members
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;

-- Avoid recursion by checking user_id directly for select
CREATE POLICY "Users can view memberships they are part of." ON conversation_members
  FOR SELECT USING (auth.uid() = user_id);

-- Only members can view other members of the same conversation
CREATE POLICY "Members can view co-members." ON conversation_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_members AS cm
      WHERE cm.conversation_id = conversation_members.conversation_id
      AND cm.user_id = auth.uid()
    )
  );

-- Only conversation creators (implied by participant_1 or by being the poster of the linked request)
-- or members can add others? Simplified for now but more secure than before.
CREATE POLICY "Users can be added to conversations by existing participants." ON conversation_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
    OR
    EXISTS (
        SELECT 1 FROM conversation_members
        WHERE conversation_id = conversation_members.conversation_id
        AND user_id = auth.uid()
    )
    -- Allow the first member to be added (usually the creator)
    OR NOT EXISTS (
        SELECT 1 FROM conversation_members
        WHERE conversation_id = conversation_members.conversation_id
    )
  );

-- 5. Update RLS policies for conversations
DROP POLICY IF EXISTS "Users can view their own conversations." ON conversations;
CREATE POLICY "Users can view their own conversations." ON conversations
  FOR SELECT USING (
    auth.uid() = participant_1 OR
    auth.uid() = participant_2 OR
    EXISTS (
      -- Use a direct check on the table to avoid policy recursion if possible
      -- In Supabase/PostgreSQL, policies on conversation_members won't be re-evaluated
      -- when used in a subquery of a policy on conversations, UNLESS they are circular.
      -- To be safe, we can use a join or check the table directly.
      SELECT 1 FROM conversation_members
      WHERE conversation_id = conversations.id
      AND user_id = auth.uid()
    )
  );

-- 6. Update RLS policies for messages
DROP POLICY IF EXISTS "Participants can view messages in their conversations." ON messages;
CREATE POLICY "Participants can view messages in their conversations." ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        auth.uid() = conversations.participant_1 OR
        auth.uid() = conversations.participant_2 OR
        EXISTS (
          SELECT 1 FROM conversation_members
          WHERE conversation_id = conversations.id
          AND user_id = auth.uid()
        )
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
        EXISTS (
          SELECT 1 FROM conversation_members
          WHERE conversation_id = conversations.id
          AND user_id = auth.uid()
        )
      )
    )
  );
