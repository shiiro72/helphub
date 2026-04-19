-- Migration: Add volunteers, waitlist, and group messaging invitations support

-- 1. Update help_requests table
ALTER TABLE help_requests ADD COLUMN max_volunteers INTEGER DEFAULT NULL;

-- 2. Create help_request_volunteers table
CREATE TYPE volunteer_status AS ENUM ('confirmed', 'waitlisted');

CREATE TABLE IF NOT EXISTS help_request_volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status volunteer_status DEFAULT 'confirmed' NOT NULL,
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

CREATE POLICY "Posters can update volunteer status." ON help_request_volunteers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM help_requests
      WHERE id = help_request_volunteers.request_id
      AND user_id = auth.uid()
    )
  );

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

CREATE POLICY "Users can be added to conversations." ON conversation_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Create conversation_invitations table
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE IF NOT EXISTS conversation_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status invitation_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(conversation_id, invitee_id)
);

ALTER TABLE conversation_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their invitations." ON conversation_invitations
  FOR SELECT USING (auth.uid() = invitee_id OR auth.uid() = inviter_id);

CREATE POLICY "Users can create invitations." ON conversation_invitations
  FOR INSERT WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Invitees can update invitation status." ON conversation_invitations
  FOR UPDATE USING (auth.uid() = invitee_id)
  WITH CHECK (auth.uid() = invitee_id);

-- 6. Update RLS policies for conversations
DROP POLICY IF EXISTS "Users can view their own conversations." ON conversations;
CREATE POLICY "Users can view their own conversations." ON conversations
  FOR SELECT USING (
    auth.uid() = participant_1 OR
    auth.uid() = participant_2 OR
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_id = conversations.id
      AND user_id = auth.uid()
    )
  );

-- 7. Update RLS policies for messages
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
