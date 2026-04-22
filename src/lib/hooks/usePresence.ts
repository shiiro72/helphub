import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export function usePresence(user: User | null) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    if (!user) {
      setOnlineUsers(new Set());
      return;
    }

    const channelId = Math.random().toString(36).slice(2);
    const channel = supabase.channel(`global-presence:${channelId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineUsers(new Set(Object.keys(state)));
      })
      .on('presence', { event: 'join' }, ({ key }: { key: string }) => {
        setOnlineUsers((prev) => new Set([...Array.from(prev), key]));
      })
      .on('presence', { event: 'leave' }, ({ key }: { key: string }) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user]);

  return onlineUsers;
}
