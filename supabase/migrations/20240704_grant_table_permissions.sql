-- Grant permissions to anon and authenticated roles for all tables
-- This ensures the Supabase JS client can access tables with proper RLS policies

-- Grant permissions on help_requests
GRANT SELECT, INSERT, UPDATE, DELETE ON public.help_requests TO anon, authenticated;

-- Grant permissions on help_offers
GRANT SELECT, INSERT, UPDATE, DELETE ON public.help_offers TO anon, authenticated;

-- Grant permissions on profiles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO anon, authenticated;

-- Grant permissions on conversations
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO anon, authenticated;

-- Grant permissions on conversation_members
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_members TO anon, authenticated;

-- Grant permissions on conversation_invitations
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_invitations TO anon, authenticated;

-- Grant permissions on messages
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO anon, authenticated;

-- Grant permissions on ratings
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ratings TO anon, authenticated;

-- Grant permissions on support_tickets
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_tickets TO anon, authenticated;

-- Grant permissions on all sequences (for auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
