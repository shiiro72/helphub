import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Conversation, Message, Profile, HelpRequest } from '@/lib/types';
import { MessageBubble } from '../molecules/MessageBubble';
import { ChatInput } from '../molecules/ChatInput';
import {
  User,
  MoreVertical,
  Flag,
  Ban,
  Users,
  ExternalLink,
  X,
  MessageSquare,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { VerificationBadge } from '../atoms/VerificationBadge';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

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
  const router = useRouter();
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
  const [showMembersModal, setShowMembersModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [supabase] = useState(() => createClient());

  const markAsRead = useCallback(async (messageId: string) => {
    await supabase.from('messages').update({ is_read: true }).eq('id', messageId);
  }, [supabase]);

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
        (payload: RealtimePostgresChangesPayload<Message>) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;

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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, conversation.id, conversation.request_id, currentUserId, markAsRead]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const markAllRead = async () => {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversation.id)
        .neq('sender_id', currentUserId)
        .eq('is_read', false);
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

  const handleMessageUser = (userId: string) => {
    router.push(`/messages?userId=${userId}`);
    setShowMembersModal(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-chat-bg relative">
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
                  {conversation.members?.length || 0} {t('members')}
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
              {conversation.is_group ? (
                <>
                  <button
                    onClick={() => {
                      setShowMembersModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-brand-background flex items-center gap-2 text-brand-text-main"
                  >
                    <Users size={16} />
                    {t('see_members')}
                  </button>
                </>
              ) : (
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
                      <Ban size={16} />
                      {t('block_user')}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (otherParticipantId) onReport(otherParticipantId);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-brand-background flex items-center gap-2 text-brand-text-main"
                  >
                    <Flag size={16} />
                    {t('report_user')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Request Preview for Group Chats */}
      {conversation.is_group && request && (
        <div className="bg-brand-surface border-b border-brand-border px-4 py-2 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-brand-text-secondary">
              {t('linked_request')}
            </span>
            <span className="text-sm font-medium text-brand-text-main truncate max-w-md">
              {request.title}
            </span>
          </div>
          <a
            href={`/requests?id=${request.id}`}
            className="text-brand-primary hover:text-brand-primary/80 transition-colors"
            title={t('view_request')}
          >
            <ExternalLink size={18} />
          </a>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:px-12 md:py-8 space-y-1">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-brand-text-secondary">{t('loading_messages')}</p>
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

      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-brand-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-brand-border flex justify-between items-center bg-brand-surface sticky top-0 z-10">
              <h2 className="text-lg font-bold text-brand-text-main">{t('group_members')}</h2>
              <button onClick={() => setShowMembersModal(false)} className="text-brand-text-secondary hover:text-brand-text-main">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-4">
              {conversation.members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-brand-background transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-border/30 flex items-center justify-center overflow-hidden">
                      <User size={20} className="text-brand-text-secondary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-brand-text-main">{member.username}</span>
                        <VerificationBadge isVerified={member.is_verified} size={14} className="text-brand-primary" />
                      </div>
                    </div>
                  </div>
                  {member.id !== currentUserId && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMessageUser(member.id)}
                        className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-full transition-colors"
                        title={t('message_user')}
                      >
                        <MessageSquare size={18} />
                      </button>
                      <button
                        onClick={() => {
                          onReport(member.id);
                          setShowMembersModal(false);
                        }}
                        className="p-2 text-brand-text-secondary hover:bg-brand-error/10 hover:text-brand-error rounded-full transition-colors"
                        title={t('report_user')}
                      >
                        <Flag size={18} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
