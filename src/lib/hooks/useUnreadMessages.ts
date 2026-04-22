import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export function useUnreadMessages(user: User | null) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [supabase] = useState(() => createClient());

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .neq('sender_id', user.id);

    if (!error) {
      setUnreadCount(count || 0);
    }
  }, [supabase, user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    fetchUnreadCount();

    const channel = supabase
      .channel('unread-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchUnreadCount();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user, fetchUnreadCount]);

  return unreadCount;
}
