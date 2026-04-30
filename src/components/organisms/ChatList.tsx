import React from 'react';
import { Conversation } from '@/lib/types';
import { User, Users } from 'lucide-react';
import { VerificationBadge } from '../atoms/VerificationBadge';

interface ChatListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (conversation: Conversation) => void;
  onlineUsers?: Set<string>;
  loading?: boolean;
}

export const ChatList: React.FC<ChatListProps> = ({
  conversations,
  activeId,
  onSelect,
  onlineUsers,
  loading = false,
}) => {
  return (
    <div className="flex flex-col h-full bg-chat-sidebar overflow-y-auto border-r border-brand-border">
      <div className="p-4 border-b border-brand-border bg-chat-header">
        <h2 className="text-xl font-bold text-brand-text-main">Chats</h2>
      </div>
      <div className="grow overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-brand-text-secondary">No conversations yet.</div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`w-full flex items-center p-4 border-b border-brand-border/30 hover:bg-chat-item-hover transition-colors ${
                activeId === conv.id ? 'bg-chat-item-active' : ''
              }`}
            >
              <div className="relative mr-4 shrink-0">
                <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center overflow-hidden">
                  {conv.is_group ? (
                    <Users size={24} className="text-white" />
                  ) : (
                    <User size={24} className="text-white" />
                  )}
                </div>
                {!conv.is_group && onlineUsers?.has(conv.profiles?.id || '') && (
                  <div
                    className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"
                    title="Online"
                  />
                )}
              </div>
              <div className="grow text-left overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <h3
                      className={`text-brand-text-main truncate ${(conv.unreadCount || 0) > 0 ? 'font-black' : 'font-medium'}`}
                    >
                      {conv.is_group ? conv.title : conv.profiles?.username || 'User'}
                    </h3>
                    {!conv.is_group && (
                      <VerificationBadge isVerified={conv.profiles?.is_verified} size={14} />
                    )}
                  </div>
                  <span className="text-xs text-zinc-500">
                    {new Date(conv.last_message_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p
                    className={`text-sm truncate grow ${
                      (conv.unreadCount || 0) > 0
                        ? 'text-brand-text-main font-bold'
                        : 'text-brand-text-secondary/70'
                    }`}
                  >
                    {conv.lastMessage?.content || 'Click to chat'}
                  </p>
                  {(conv.unreadCount || 0) > 0 && (
                    <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-brand-error rounded-full shrink-0">
                      {conv.unreadCount! > 99 ? '99+' : conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
