-- 1. Create Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_group BOOLEAN DEFAULT false NOT NULL,
  title TEXT,
  request_id UUID,
  last_message_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT participants_different CHECK (participant_1 <> participant_2)
);

-- 2. Partial unique index for 1-on-1 conversations
CREATE UNIQUE INDEX IF NOT EXISTS unique_1on1_conversation ON conversations (LEAST(participant_1, participant_2), GREATEST(participant_1, participant_2))
WHERE is_group = false;

-- 3. Create Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Create Blocks table
CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_block UNIQUE (blocker_id, blocked_id),
  CONSTRAINT blocker_blocked_different CHECK (blocker_id <> blocked_id)
);

-- 5. Create Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. Set up Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 7. Policies (Initial - basic access)
DROP POLICY IF EXISTS "Users can view their own conversations." ON conversations;
CREATE POLICY "Users can view their own conversations." ON conversations
  FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

DROP POLICY IF EXISTS "Users can create conversations." ON conversations;
CREATE POLICY "Users can create conversations." ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() = participant_1 OR
    auth.uid() = participant_2 OR
    (is_group = true AND auth.uid() IS NOT NULL)
  );

DROP POLICY IF EXISTS "Participants can view messages." ON messages;
CREATE POLICY "Participants can view messages." ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (auth.uid() = conversations.participant_1 OR auth.uid() = conversations.participant_2)
    )
  );

DROP POLICY IF EXISTS "Participants can insert messages." ON messages;
CREATE POLICY "Participants can insert messages." ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (auth.uid() = conversations.participant_1 OR auth.uid() = conversations.participant_2)
    )
  );

DROP POLICY IF EXISTS "Participants can update message read status." ON messages;
CREATE POLICY "Participants can update message read status." ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (auth.uid() = conversations.participant_1 OR auth.uid() = conversations.participant_2)
    )
  )
  WITH CHECK (auth.uid() <> sender_id);

-- 8. Policies for Blocks
CREATE POLICY "Users can view their own blocks." ON blocks
  FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can manage their own blocks." ON blocks
  FOR ALL USING (auth.uid() = blocker_id);

-- 9. Policies for Reports
CREATE POLICY "Users can create reports." ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports." ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- 10. Trigger to update last_message_at
CREATE OR REPLACE FUNCTION update_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_last_message_at
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_last_message_at();
