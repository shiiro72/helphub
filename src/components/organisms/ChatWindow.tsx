import React, { useEffect, useRef, useState } from 'react';
import { Conversation, Message, Profile } from '@/lib/types';
import { MessageBubble } from '../molecules/MessageBubble';
import { ChatInput } from '../molecules/ChatInput';
import { User, MoreVertical, Flag, Ban, Star, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { VerificationBadge } from '../atoms/VerificationBadge';
import { StarRating } from '../atoms/StarRating';
import { RatingModal } from '../molecules/RatingModal';
import { useTranslations } from 'next-intl';

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onBlock: (userId: string) => void;
  onReport: (userId: string) => void;
  isOnline?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  currentUserId,
  onSendMessage,
  onBlock,
  onReport,
  isOnline = false,
}) => {
  const t = useTranslations();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSendMessageLocally = (content: string) => {
    // Optimistic update
    const tempMsg: Message = {
      id: Math.random().toString(),
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
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [supabase] = useState(() => createClient());

  const markAsRead = async (messageId: string) => {
    await supabase.from('messages').update({ is_read: true }).eq('id', messageId);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', currentUserId).single();
      setCurrentUserProfile(data);
    };
    fetchProfile();
  }, [supabase, currentUserId]);

  useEffect(() => {
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
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload: { new: Message }) => {
          const newMessage = payload.new as Message;
          console.log('Received new message via realtime:', newMessage);
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });

          // Mark as read if it's from the other person
          if (newMessage.sender_id !== currentUserId) {
            markAsRead(newMessage.id);
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload: { new: Message }) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) => prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)));
        },
      )
      .subscribe();

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
    // Mark all existing unread messages from the other person as read
    const markAllRead = async () => {
      const unreadIds = messages
        .filter((m) => !m.is_read && m.sender_id !== currentUserId)
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
      }
    };

    if (!loading) {
      markAllRead();
    }
  }, [messages, loading, currentUserId]);

  const otherParticipantId = conversation.is_group
    ? null
    : conversation.participant_1 === currentUserId
      ? conversation.participant_2
      : conversation.participant_1;

  const handleRateUser = async (rating: number, tags: string[], comment: string) => {
    setIsSubmittingRating(true);
    try {
      const { error } = await supabase.from('ratings').upsert({
        rater_id: currentUserId,
        rated_id: otherParticipantId,
        rating,
        tags,
        comment,
      });

      if (error) throw error;
      setShowRatingModal(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-chat-bg">
      {/* Header */}
      <div className="bg-chat-header p-3 flex justify-between items-center border-b border-brand-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center overflow-hidden">
            {conversation.is_group ? (
              <Users size={20} className="text-white" />
            ) : conversation.profiles?.image_url ? (
              <img
                src={conversation.profiles.image_url}
                alt={conversation.profiles.username}
                className="w-full h-full object-cover"
              />
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
                  <button
                    onClick={() => {
                      if (otherParticipantId) onBlock(otherParticipantId);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-brand-background flex items-center gap-2 text-brand-error"
                  >
                    Block User
                  </button>
                  <button
                    onClick={() => {
                      setShowRatingModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-brand-background flex items-center gap-2 text-brand-text-main"
                  >
                    Rate User
                  </button>
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

      {/* Messages */}
      <div ref={scrollRef} className="grow overflow-y-auto p-4 md:px-12 md:py-8 space-y-1">
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
      {currentUserProfile?.is_restricted ? (
        <div className="bg-brand-surface px-4 py-3 text-center text-sm text-brand-error border-t border-brand-border">
          {t('messaging_restricted')}
        </div>
      ) : (
        <ChatInput onSendMessage={handleSendMessageLocally} />
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRateUser}
        userName={conversation.profiles?.username || 'User'}
        isSubmitting={isSubmittingRating}
      />
    </div>
  );
};
