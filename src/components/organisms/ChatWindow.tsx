import React, { useEffect, useRef, useState } from 'react';
import { Conversation, Message } from '@/lib/types';
import { MessageBubble } from '../molecules/MessageBubble';
import { ChatInput } from '../molecules/ChatInput';
import { User, MoreVertical, Flag, Ban } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { VerificationBadge } from '../atoms/VerificationBadge';

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onBlock: (userId: string) => void;
  onReport: (userId: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  currentUserId,
  onSendMessage,
  onBlock,
  onReport,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
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
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);

          // Mark as read if it's from the other person
          if (newMessage.sender_id !== currentUserId) {
            markAsRead(newMessage.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, currentUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);
  };

  useEffect(() => {
    // Mark all existing unread messages from the other person as read
    const markAllRead = async () => {
      const unreadIds = messages
        .filter((m) => !m.is_read && m.sender_id !== currentUserId)
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadIds);
      }
    };

    if (!loading) {
      markAllRead();
    }
  }, [messages, loading, currentUserId]);

  const otherParticipantId =
    conversation.participant_1 === currentUserId
      ? conversation.participant_2
      : conversation.participant_1;

  return (
    <div className="flex flex-col h-full bg-chat-bg">
      {/* Header */}
      <div className="bg-chat-header p-3 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
            {conversation.profiles?.image_url ? (
              <img
                src={conversation.profiles.image_url}
                alt={conversation.profiles.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={20} className="text-zinc-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {conversation.profiles?.username || 'User'}
              </h3>
              <VerificationBadge isVerified={conversation.profiles?.is_verified} size={14} />
            </div>
            <p className="text-[10px] text-zinc-500">online</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-chat-menu-bg shadow-lg rounded-md overflow-hidden z-10 border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  onBlock(otherParticipantId);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-chat-menu-hover flex items-center gap-2 text-red-500"
              >
                <Ban size={16} /> Block User
              </button>
              <button
                onClick={() => {
                  onReport(otherParticipantId);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-chat-menu-hover flex items-center gap-2 text-zinc-700 dark:text-zinc-300"
              >
                <Flag size={16} /> Report User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-4 md:p-8 space-y-1"
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-zinc-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-1 rounded text-xs">
              Messages are end-to-end encrypted
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
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
};
