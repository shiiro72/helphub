import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { Navbar } from '@/components/organisms/Navbar';
import { ChatList } from '@/components/organisms/ChatList';
import { ChatWindow } from '@/components/organisms/ChatWindow';
import { createClient } from '@/lib/supabase/client';
import { Conversation } from '@/lib/types';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

export default function MessagesPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const router = useRouter();
  const { userId } = router.query;
  const [supabase] = useState(() => createClient());

  const startNewConversation = useCallback(async (currentUserId: string, otherUserId: string) => {
    // Check if other user exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', otherUserId)
      .single();

    if (!profile) return;

    // Sort IDs to maintain uniqueness constraint
    const [p1, p2] = [currentUserId, otherUserId].sort();

    const { data, error } = await supabase
      .from('conversations')
      .insert({ participant_1: p1, participant_2: p2 })
      .select(`
        *,
        participant_1_profile:profiles!participant_1(*),
        participant_2_profile:profiles!participant_2(*)
      `)
      .single();

    if (error) {
      console.error('Error starting conversation:', error);
    } else if (data) {
      const otherProfile = data.participant_1 === currentUserId
          ? data.participant_2_profile
          : data.participant_1_profile;
      const newConv = { ...data, profiles: otherProfile } as Conversation;
      setConversations(prev => [newConv, ...prev]);
      setActiveConversation(newConv);
    }
  }, [supabase]);

  const fetchConversations = useCallback(async (currentUserId: string) => {
    // Fetch conversations where user is participant 1 or 2
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1_profile:profiles!participant_1(*),
        participant_2_profile:profiles!participant_2(*)
      `)
      .or(`participant_1.eq.${currentUserId},participant_2.eq.${currentUserId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
    } else {
      const processed = (data || []).map((conv) => {
        const otherProfile = conv.participant_1 === currentUserId
          ? conv.participant_2_profile
          : conv.participant_1_profile;
        return {
          ...conv,
          profiles: otherProfile
        } as Conversation;
      });
      setConversations(processed);

      // If userId in query, find or create conversation
      if (userId && typeof userId === 'string') {
        const existing = processed.find(c =>
          c.participant_1 === userId || c.participant_2 === userId
        );
        if (existing) {
          setActiveConversation(existing);
        } else {
          // Create new conversation
          startNewConversation(currentUserId, userId);
        }
      }
    }
  }, [supabase, userId, startNewConversation]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        fetchConversations(user.id);
      }
    };
    checkUser();
  }, [supabase, router, fetchConversations]);

  const handleSendMessage = async (content: string) => {
    if (!activeConversation || !user) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConversation.id,
        sender_id: user.id,
        content: content
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
      alert('Error blocking user');
    } else {
      alert('User blocked');
      setActiveConversation(null);
      fetchConversations(user.id);
    }
  };

  const handleReport = async (reportedId: string) => {
    if (!user) return;
    const reason = prompt('Please enter the reason for reporting:');
    if (!reason) return;

    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        reported_id: reportedId,
        reason: reason
      });

    if (error) {
      alert('Error reporting user');
    } else {
      alert('User reported');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-black overflow-hidden">
      <Head>
        <title>Messages | HelpHub</title>
      </Head>
      <Navbar />
      <main className="flex-grow flex overflow-hidden">
        <div className="w-full md:w-1/3 border-r border-zinc-200 dark:border-zinc-800">
          <ChatList
            conversations={conversations}
            currentUserId={user?.id || ''}
            activeId={activeConversation?.id}
            onSelect={setActiveConversation}
          />
        </div>
        <div className="hidden md:flex flex-grow bg-chat-bg">
          {activeConversation && user ? (
            <ChatWindow
              conversation={activeConversation}
              currentUserId={user.id}
              onSendMessage={handleSendMessage}
              onBlock={handleBlock}
              onReport={handleReport}
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full text-center p-8">
              <div className="w-24 h-24 rounded-full bg-brand-success flex items-center justify-center mb-6">
                <span className="text-white text-4xl font-bold">HH</span>
              </div>
              <h2 className="text-2xl font-light text-zinc-900 dark:text-zinc-100 mb-2">
                HelpHub for Desktop
              </h2>
              <p className="text-zinc-500 max-w-sm">
                Send and receive messages without keeping your phone online.
                Use HelpHub on up to 4 linked devices and 1 phone at the same time.
              </p>
            </div>
          )}
        </div>

        {/* Mobile View: Overlay or separate screen needed, simplified here */}
        {activeConversation && user && (
           <div className="fixed inset-0 z-[60] md:hidden bg-white dark:bg-black">
              <div className="h-full flex flex-col">
                <button
                  onClick={() => setActiveConversation(null)}
                  className="p-4 text-sm font-medium text-blue-600 flex items-center"
                >
                  ← Back
                </button>
                <div className="flex-grow overflow-hidden">
                   <ChatWindow
                    conversation={activeConversation}
                    currentUserId={user.id}
                    onSendMessage={handleSendMessage}
                    onBlock={handleBlock}
                    onReport={handleReport}
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
    ...(await serverSideTranslations(locale ?? 'en', ['common'])),
  },
});
