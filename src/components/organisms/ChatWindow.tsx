import React, { useEffect, useRef, useState } from 'react';
import { Conversation, Message, Profile, HelpRequest } from '@/lib/types';
import { MessageBubble } from '../molecules/MessageBubble';
import { ChatInput } from '../molecules/ChatInput';
import { User, MoreVertical, Flag, Ban, Star, Users, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { VerificationBadge } from '../atoms/VerificationBadge';
import { useTranslations } from 'next-intl';

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onBlock: (userId: string) => void;
  onUnblock: (userId: string) => void;
  onReport: (userId: string) => void;
  isOnline?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  currentUserId,
  onSendMessage,
  onBlock,
  onUnblock,
  onReport,
  isOnline = false,
}) => {
  const t = useTranslations();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<HelpRequest | null>(null);

  const handleSendMessageLocally = (content: string) => {
    // Optimistic update
    const tempMsg: Message = {
      id: `temp-${Math.random().toString(36).slice(2)}`,
      conversation_id: conversation.id,
      sender_id: currentUserId,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    onSendMessage(content);
  };
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [supabase] = useState(() => createClient());

  const markAsRead = async (messageId: string) => {
    await supabase.from('messages').update({ is_read: true }).eq('id', messageId);
  };


  useEffect(() => {
    const fetchRequest = async () => {
      if (conversation.request_id) {
        const { data } = await supabase
          .from('help_requests')
          .select('*')
          .eq('id', conversation.request_id)
          .single();
        setRequest(data);
      }
    };
    fetchRequest();

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
        } else {
          console.log(`Fetched ${data?.length || 0} messages for conversation ${conversation.id}`);
          setMessages(data || []);
        }
      } catch (err) {
        console.error('Unexpected error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channelName = `messages:${conversation.id}:${Math.random().toString(36).slice(2)}`;
    console.log('Subscribing to realtime messages for conversation:', conversation.id);
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            console.log('Received new message via realtime:', newMessage);

            setMessages((prev) => {
              const filtered =
                newMessage.sender_id === currentUserId
                  ? prev.filter((m) => !m.id.startsWith('temp-'))
                  : prev;

              if (filtered.find((m) => m.id === newMessage.id)) return filtered;
              return [...filtered, newMessage];
            });

            if (newMessage.sender_id !== currentUserId) {
              markAsRead(newMessage.id);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as Message;
            setMessages((prev) =>
              prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)),
            );
          }
        },
      )
      .subscribe((status: string) => {
        console.log(`Realtime subscription status for ${channelName}:`, status);
      });

    return () => {
      console.log('Unsubscribing from channel:', channelName);
      supabase.removeChannel(channel);
    };
  }, [supabase, conversation.id, currentUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Mark all existing unread messages from the other person as read immediately
    const markAllRead = async () => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversation.id)
        .neq('sender_id', currentUserId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking messages as read:', error);
      } else {
        console.log(`Marked messages as read for conversation ${conversation.id}`);
      }
    };

    markAllRead();
  }, [conversation.id, currentUserId, supabase]);

  const otherParticipantId = conversation.is_group
    ? null
    : conversation.participant_1 === currentUserId
      ? conversation.participant_2
      : conversation.participant_1;

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', currentUserId).single();
      setCurrentUserProfile(data);
    };
    fetchProfile();

    const checkBlock = async () => {
      if (!otherParticipantId) return;
      const { data } = await supabase
        .from('blocks')
        .select('*')
        .or(
          `and(blocker_id.eq.${currentUserId},blocked_id.eq.${otherParticipantId}),and(blocker_id.eq.${otherParticipantId},blocked_id.eq.${currentUserId})`,
        )
        .maybeSingle();
      setIsBlocked(!!data);
    };
    checkBlock();
  }, [supabase, currentUserId, otherParticipantId]);

  return (
    <div className="flex flex-col h-full w-full bg-chat-bg">
      {/* Header */}
      <div className="bg-chat-header p-3 flex justify-between items-center border-b border-brand-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center overflow-hidden">
            {conversation.is_group ? (
              <Users size={20} className="text-white" />
            ) : (
              <User size={20} className="text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-brand-text-main">
                {conversation.is_group
                  ? conversation.title
                  : conversation.profiles?.username || 'User'}
              </h3>
              {!conversation.is_group && (
                <VerificationBadge isVerified={conversation.profiles?.is_verified} size={14} />
              )}
            </div>
            {conversation.is_group ? (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-brand-text-secondary">
                  {conversation.members?.length || 0} members
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] ${isOnline ? 'text-brand-success font-medium' : 'text-brand-text-secondary'}`}
                >
                  {isOnline ? 'online' : 'offline'}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-brand-text-secondary hover:text-brand-text-main"
          >
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-brand-surface shadow-lg rounded-md overflow-hidden z-10 border border-brand-border">
              {!conversation.is_group ? (
                <>
                  {isBlocked ? (
                    <button
                      onClick={() => {
                        if (otherParticipantId) onUnblock(otherParticipantId);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-brand-background flex items-center gap-2 text-brand-success"
                    >
                      Unblock User
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (otherParticipantId) onBlock(otherParticipantId);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-brand-background flex items-center gap-2 text-brand-error"
                    >
                      Block User
                    </button>
                  )}
                </>
              ) : null}
              <button
                onClick={() => {
                  if (otherParticipantId) onReport(otherParticipantId);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-brand-background flex items-center gap-2 text-brand-text-main"
              >
                Report User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Request Preview for Group Chats */}
      {conversation.is_group && request && (
        <div className="bg-brand-surface border-b border-brand-border px-4 py-2 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-brand-text-secondary">
              Linked Request
            </span>
            <span className="text-sm font-medium text-brand-text-main truncate max-w-md">
              {request.title}
            </span>
          </div>
          <a
            href={`/requests?id=${request.id}`}
            className="text-brand-primary hover:text-brand-primary/80 transition-colors"
            title="View Request"
          >
            <ExternalLink size={18} />
          </a>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:px-12 md:py-8 space-y-1">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-brand-text-secondary">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="bg-brand-primary/10 text-brand-primary px-4 py-1 rounded text-xs">
              {t('start_chatting')}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwnMessage={msg.sender_id === currentUserId}
            />
          ))
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 bg-chat-header border-t border-brand-border pb-safe">
        {isBlocked ? (
          <div className="px-4 py-3 text-center text-sm text-brand-text-secondary italic">
            {t('cannot_message_blocked')}
          </div>
        ) : currentUserProfile?.is_restricted ? (
          <div className="px-4 py-3 text-center text-sm text-brand-error">
            {t('messaging_restricted')}
          </div>
        ) : (
          <ChatInput onSendMessage={handleSendMessageLocally} />
        )}
      </div>

    </div>
  );
};
