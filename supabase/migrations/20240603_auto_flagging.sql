-- 1. Add is_restricted to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_restricted BOOLEAN DEFAULT false;

-- 2. Function to check report count and restrict user
CREATE OR REPLACE FUNCTION check_reports_and_restrict()
RETURNS TRIGGER AS $$
DECLARE
  report_count INTEGER;
BEGIN
  -- Count unique reporters for the reported user
  SELECT COUNT(DISTINCT reporter_id) INTO report_count
  FROM reports
  WHERE reported_id = NEW.reported_id;

  -- If 3 or more unique reports, restrict the user
  IF report_count >= 3 THEN
    UPDATE profiles
    SET is_restricted = true
    WHERE id = NEW.reported_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger on reports table
CREATE TRIGGER trigger_check_reports_and_restrict
AFTER INSERT ON reports
FOR EACH ROW
EXECUTE FUNCTION check_reports_and_restrict();

-- 4. Update messages policy to prevent restricted users from sending messages
-- First, drop existing insert policy
DROP POLICY IF EXISTS "Participants can insert messages in their conversations." ON messages;

-- Re-create with restriction check
CREATE POLICY "Participants can insert messages in their conversations." ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (auth.uid() = conversations.participant_1 OR auth.uid() = conversations.participant_2)
    ) AND
    NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_restricted = true
    )
  );

-- 5. Add constraint to prevent image sharing in messages (simple regex for image extensions)
ALTER TABLE messages ADD CONSTRAINT no_images_in_messages
  CHECK (content !~* '.*\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$');
