-- 1. Create archived_users table
CREATE TABLE IF NOT EXISTS archived_users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  reason TEXT,
  banned_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Set up RLS for archived_users
ALTER TABLE archived_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view archived users." ON archived_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 3. Function to ban and delete a user
CREATE OR REPLACE FUNCTION ban_user(target_user_id UUID, ban_reason TEXT)
RETURNS void AS $$
DECLARE
  target_email TEXT;
  target_username TEXT;
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can ban users';
  END IF;

  -- Get user info from auth.users and public.profiles
  SELECT email INTO target_email FROM auth.users WHERE id = target_user_id;
  SELECT username INTO target_username FROM public.profiles WHERE id = target_user_id;

  -- Insert into archived_users
  INSERT INTO archived_users (id, email, username, reason)
  VALUES (target_user_id, target_email, target_username, ban_reason)
  ON CONFLICT (email) DO UPDATE
  SET reason = ban_reason, banned_at = now();

  -- Delete from auth.users (cascades to profiles)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger to prevent re-registration with banned email
CREATE OR REPLACE FUNCTION check_banned_email()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.archived_users WHERE email = NEW.email) THEN
    RAISE EXCEPTION 'This email is banned and cannot be used to create a new account.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if trigger already exists before creating
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_signup_check_ban') THEN
    CREATE TRIGGER on_auth_user_signup_check_ban
      BEFORE INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION check_banned_email();
  END IF;
END $$;
