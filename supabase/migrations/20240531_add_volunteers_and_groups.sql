-- Migration: Add volunteers, waitlist, and group messaging support

-- 1. Update help_requests table
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS max_volunteers INTEGER DEFAULT NULL;

-- 2. Create help_request_volunteers table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'volunteer_status') THEN
    CREATE TYPE volunteer_status AS ENUM ('confirmed', 'waitlisted');
  END IF;
END$$;

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

-- 3. Create conversation_members table
CREATE TABLE IF NOT EXISTS conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS for conversation_members
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;

-- Initial policy for membership (updated in later migration)
CREATE POLICY "Users can view memberships they are part of." ON conversation_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can be added to conversations." ON conversation_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Create conversation_invitations table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_status') THEN
    CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'rejected');
  END IF;
END$$;

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
