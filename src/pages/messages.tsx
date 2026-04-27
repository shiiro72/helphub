import React, { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import { Navbar } from '@/components/organisms/Navbar';
import { ChatList } from '@/components/organisms/ChatList';
import { ChatWindow } from '@/components/organisms/ChatWindow';
import { createClient } from '@/lib/supabase/client';
import { Conversation, ConversationInvitation, Message, Profile } from '@/lib/types';
import { User as SupabaseUser, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/atoms/Button';
import { User, Check, X } from 'lucide-react';
import { usePresence } from '@/lib/contexts/PresenceContext';
import { useToast } from '@/lib/contexts/ToastContext';
import { ReportModal } from '@/components/molecules/ReportModal';

export default function MessagesPage() {
  const t = useTranslations();
  const { showToast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [invitations, setInvitations] = useState<ConversationInvitation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [_blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());
  const [reportingUserId, setReportingUserId] = useState<string | null>(null);
  const [isReporting, setIsReporting] = useState(false);
  const { onlineUsers } = usePresence();
  const router = useRouter();
  const { userId, conversationId } = router.query;
  const [supabase] = useState(() => createClient());

  const isStartingConversation = useRef(false);

  const startNewConversation = useCallback(
    async (currentUserId: string, otherUserId: string) => {
      if (isStartingConversation.current) return;
      isStartingConversation.current = true;

      const [p1, p2] = [currentUserId, otherUserId].sort();

      const { data: existing } = await supabase
        .from('conversations')
        .select(
          `
          *,
          participant_1_profile:profiles!participant_1(*),
          participant_2_profile:profiles!participant_2(*)
        `,
        )
        .eq('participant_1', p1)
        .eq('participant_2', p2)
        .eq('is_group', false)
        .maybeSingle();

      if (existing) {
        const otherProfile =
          existing.participant_1 === currentUserId
            ? existing.participant_2_profile
            : existing.participant_1_profile;
        const conv = { ...existing, profiles: otherProfile } as Conversation;
        setConversations((prev) => {
          if (prev.find((c) => c.id === conv.id)) return prev;
          return [conv, ...prev];
        });
        setActiveConversation(conv);
        isStartingConversation.current = false;
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single();

      if (!profile) {
        isStartingConversation.current = false;
        return;
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({ participant_1: p1, participant_2: p2, is_group: false })
        .select(
          `
        *,
        participant_1_profile:profiles!participant_1(*),
        participant_2_profile:profiles!participant_2(*)
      `,
        )
        .maybeSingle();

      if (error) {
        console.error('Error starting conversation:', error);
      } else if (data) {
        const otherProfile =
          data.participant_1 === currentUserId
            ? data.participant_2_profile
            : data.participant_1_profile;
        const newConv = { ...data, profiles: otherProfile } as Conversation;
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversation(newConv);
      }
      isStartingConversation.current = false;
    },
    [supabase],
  );

  const fetchConversations = useCallback(
    async (currentUserId: string) => {
      // 0. Fetch blocked users
      const { data: blocks } = await supabase
        .from('blocks')
        .select('blocked_id, blocker_id')
        .or(`blocker_id.eq.${currentUserId},blocked_id.eq.${currentUserId}`);

      const bIds = new Set<string>();
      if (blocks) {
        blocks.forEach((b: { blocked_id: string; blocker_id: string }) => {
          if (b.blocker_id === currentUserId) bIds.add(b.blocked_id);
          else bIds.add(b.blocker_id);
        });
      }
      setBlockedUserIds(bIds);

      const { data, error } = await supabase
        .from('conversations')
        .select(
          `
          *,
          participant_1_profile:profiles!participant_1(*),
          participant_2_profile:profiles!participant_2(*),
          members:conversation_members(
            profiles(*)
          ),
          messages(content, created_at, sender_id, is_read)
        `,
        )
        .order('created_at', { foreignTable: 'messages', ascending: false })
        .limit(1, { foreignTable: 'messages' });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      const allConversations = (data || []).sort(
        (a: Conversation, b: Conversation) =>
          new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime(),
      );

      const processed = allConversations.map((conv: Conversation) => {
        const lastMessage = conv.messages?.[0];

        if (conv.is_group) {
          const joinedMembers =
            (conv.members as unknown as { profiles: Profile }[])?.map((m) => m.profiles) || [];

          const p1 = conv.participant_1_profile as unknown as Profile;
          const p2 = conv.participant_2_profile as unknown as Profile;

          const membersMap = new Map<string, Profile>();
          joinedMembers.forEach((m) => membersMap.set(m.id, m));
          if (p1) membersMap.set(p1.id, p1);
          if (p2) membersMap.set(p2.id, p2);

          const members = Array.from(membersMap.values());

          return {
            ...conv,
            members,
            lastMessage,
          } as Conversation;
        }
        const otherProfile =
          conv.participant_1 === currentUserId
            ? conv.participant_2_profile
            : conv.participant_1_profile;
        return {
          ...conv,
          profiles: otherProfile,
          lastMessage,
        } as Conversation;
      });

      const { data: unreadData } = await supabase
        .from('messages')
        .select('conversation_id')
        .eq('is_read', false)
        .neq('sender_id', currentUserId);

      const unreadCounts: Record<string, number> = {};
      unreadData?.forEach((m: { conversation_id: string }) => {
        unreadCounts[m.conversation_id] = (unreadCounts[m.conversation_id] || 0) + 1;
      });

      const withUnread = processed.map((conv: Conversation) => ({
        ...conv,
        unreadCount: unreadCounts[conv.id] || 0,
      }));

      setConversations(withUnread);

      const { data: invData } = await supabase
        .from('conversation_invitations')
        .select(
          `
          *,
          conversations (*),
          inviter:profiles!inviter_id (*)
        `,
        )
        .eq('invitee_id', currentUserId)
        .eq('status', 'pending');

      if (invData) {
        setInvitations(invData as unknown as ConversationInvitation[]);
      }
    },
    [supabase],
  );

  // Sync active conversation state from URL once on load or when query params change manually
  const prevQueryRef = useRef<string>('');
  useEffect(() => {
    if (!user || !router.isReady || conversations.length === 0) return;

    const currentQuery = JSON.stringify(router.query);
    if (currentQuery === prevQueryRef.current) return;
    prevQueryRef.current = currentQuery;

    if (conversationId && typeof conversationId === 'string') {
      const existing = conversations.find((c) => c.id === conversationId);
      if (existing) {
        setActiveConversation(existing);
      }
    } else if (userId && typeof userId === 'string' && userId !== user.id) {
      const existing = conversations.find(
        (c) => !c.is_group && (c.participant_1 === userId || c.participant_2 === userId),
      );
      if (existing) {
        setActiveConversation(existing);
      } else {
        startNewConversation(user.id, userId);
      }
    }
  }, [conversations.length, user, conversationId, userId, startNewConversation, router.isReady, router.query]);

  // Handle data updates for current active conversation without loop
  useEffect(() => {
    if (activeConversation) {
      const updated = conversations.find((c) => c.id === activeConversation.id);
      if (updated && (updated.unreadCount !== activeConversation.unreadCount || updated.last_message_at !== activeConversation.last_message_at)) {
         setActiveConversation(updated);
      }
    }
  }, [conversations, activeConversation?.id]);

  useEffect(() => {
    if (!router.isReady) return;

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        fetchConversations(user.id);
      }
    };
    checkUser();
  }, [supabase, router.isReady, fetchConversations]);

  useEffect(() => {
    if (!user) return;

    const channelSuffix = Math.random().toString(36).slice(2);

    const invChannel = supabase
      .channel(`invitations:${channelSuffix}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversation_invitations' },
        () => {
          fetchConversations(user.id);
        },
      )
      .subscribe();

    const sidebarChannel = supabase
      .channel(`sidebar-updates:${channelSuffix}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => fetchConversations(user.id),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blocks',
        },
        () => fetchConversations(user.id),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_members',
        },
        () => fetchConversations(user.id),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setTimeout(() => fetchConversations(user.id), 500);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(invChannel);
      supabase.removeChannel(sidebarChannel);
    };
  }, [supabase, user, fetchConversations]);

  const handleSendMessage = async (content: string) => {
    if (!activeConversation || !user) return;

    const { error } = await supabase.from('messages').insert({
      conversation_id: activeConversation.id,
      sender_id: user.id,
      content: content,
    });

    if (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleBlock = async (blockedId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('blocks')
      .insert({ blocker_id: user.id, blocked_id: blockedId });

    if (error) {
      showToast(t('error_blocking_user'), 'error');
    } else {
      showToast(t('user_blocked'), 'success');
      fetchConversations(user.id);
    }
  };

  const handleUnblock = async (blockedId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('blocks')
      .delete()
      .or(
        `and(blocker_id.eq.${user.id},blocked_id.eq.${blockedId}),and(blocker_id.eq.${blockedId},blocked_id.eq.${user.id})`,
      );

    if (error) {
      showToast(t('error_unblocking_user'), 'error');
    } else {
      showToast(t('user_unblocked'), 'success');
      fetchConversations(user.id);
    }
  };

  const handleReport = async (reason: string) => {
    if (!user || !reportingUserId) return;
    setIsReporting(true);

    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_id: reportingUserId,
      reason: reason,
    });

    setIsReporting(false);
    setReportingUserId(null);

    if (error) {
      showToast(t('error_reporting_user'), 'error');
    } else {
      showToast(t('user_reported'), 'success');
    }
  };

  const handleAcceptInvitation = async (inv: ConversationInvitation) => {
    if (!user) return;
    await supabase.from('conversation_invitations').update({ status: 'accepted' }).eq('id', inv.id);

    await supabase.from('conversation_members').insert({
      conversation_id: inv.conversation_id,
      user_id: user.id,
    });

    fetchConversations(user.id);
    router.push(`/messages?conversationId=${inv.conversation_id}`);
  };

  const handleRejectInvitation = async (inv: ConversationInvitation) => {
    if (!user) return;
    await supabase.from('conversation_invitations').update({ status: 'rejected' }).eq('id', inv.id);

    fetchConversations(user.id);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-brand-background overflow-hidden">
      <Head>
        <title>Messages | HelpHub</title>
      </Head>
      <Navbar />
      <main className="grow flex overflow-hidden w-full relative">
        <div className="w-full md:w-80 lg:w-96 border-r border-brand-border flex flex-col shrink-0">
          {invitations.length > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/50">
              <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                {t('invitations')} ({invitations.length})
              </h3>
              <div className="space-y-3">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-brand-surface-container-lowest p-3 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-brand-surface-container flex items-center justify-center shrink-0 overflow-hidden">
                        <User size={16} className="text-brand-text-secondary" />
                      </div>
                      <p className="text-xs text-brand-text-secondary leading-tight">
                        <span className="font-bold text-brand-text-main">
                          {inv.inviter?.username}
                        </span>{' '}
                        {t('group_chat_invitation')}{' '}
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          &quot;{inv.conversations?.title}&quot;
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 h-8 text-[10px]"
                        onClick={() => handleAcceptInvitation(inv)}
                      >
                        <Check size={12} className="mr-1" /> {t('accept')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-[10px]"
                        onClick={() => handleRejectInvitation(inv)}
                      >
                        <X size={12} className="mr-1" /> {t('reject')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grow overflow-hidden">
            <ChatList
              conversations={conversations}
              activeId={activeConversation?.id}
              onSelect={(conv) => {
                setActiveConversation(conv);
                router.push(`/messages?conversationId=${conv.id}`, undefined, { shallow: true });
              }}
              onlineUsers={onlineUsers}
            />
          </div>
        </div>
        <div className="hidden md:flex grow bg-chat-bg">
          {activeConversation && user ? (
            <ChatWindow
              conversation={activeConversation}
              currentUserId={user.id}
              onSendMessage={handleSendMessage}
              onBlock={handleBlock}
              onUnblock={handleUnblock}
              onReport={(id) => setReportingUserId(id)}
              isOnline={
                !activeConversation.is_group &&
                (activeConversation.participant_1 === user.id
                  ? onlineUsers.has(activeConversation.participant_2!)
                  : onlineUsers.has(activeConversation.participant_1!))
              }
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full text-center p-8">
              <div className="w-24 h-24 rounded-full bg-brand-primary flex items-center justify-center mb-6">
                <span className="text-white text-4xl font-bold">HH</span>
              </div>
              <h2 className="text-2xl font-bold text-brand-secondary mb-2">
                {t('messages_welcome_title')}
              </h2>
              <p className="text-brand-text-secondary max-w-sm">{t('messages_welcome_desc')}</p>
            </div>
          )}
        </div>

        <ReportModal
          isOpen={!!reportingUserId}
          onClose={() => setReportingUserId(null)}
          onConfirm={handleReport}
          userName={
            conversations.find(
              (c) =>
                !c.is_group &&
                (c.participant_1 === reportingUserId || c.participant_2 === reportingUserId),
            )?.profiles?.username || 'User'
          }
          isSubmitting={isReporting}
        />

        {activeConversation && user && (
          <div className="fixed inset-0 z-[60] md:hidden bg-brand-surface overflow-hidden">
            <div className="h-[100dvh] flex flex-col">
              <button
                onClick={() => setActiveConversation(null)}
                className="p-4 text-sm font-medium text-brand-primary flex items-center bg-brand-surface border-b border-brand-border shrink-0"
              >
                ← Back
              </button>
              <div className="flex-1 overflow-hidden">
                <ChatWindow
                  conversation={activeConversation}
                  currentUserId={user.id}
                  onSendMessage={handleSendMessage}
                  onBlock={handleBlock}
                  onUnblock={handleUnblock}
              onReport={(id) => setReportingUserId(id)}
                  isOnline={
                    !activeConversation.is_group &&
                    (activeConversation.participant_1 === user.id
                      ? onlineUsers.has(activeConversation.participant_2!)
                      : onlineUsers.has(activeConversation.participant_1!))
                  }
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    messages: (await import(`../../messages/${locale ?? 'en'}.json`)).default,
  },
});
