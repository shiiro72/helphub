import React from 'react';
import { Conversation } from '@/lib/types';
import { User } from 'lucide-react';

interface ChatListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (conversation: Conversation) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  conversations,
  activeId,
  onSelect,
}) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111b21] overflow-y-auto border-r border-zinc-200 dark:border-zinc-800">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-[#f0f2f5] dark:bg-[#202c33]">
        <h2 className="text-xl font-bold">Chats</h2>
      </div>
      <div className="flex-grow overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            No conversations yet.
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`w-full flex items-center p-4 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] transition-colors ${
                activeId === conv.id ? 'bg-[#f0f2f5] dark:bg-[#2a3942]' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center mr-4 shrink-0">
                {conv.profiles?.image_url ? (
                  <img
                    src={conv.profiles.image_url}
                    alt={conv.profiles.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={24} className="text-zinc-500" />
                )}
              </div>
              <div className="flex-grow text-left overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {conv.profiles?.username || 'User'}
                  </h3>
                  <span className="text-xs text-zinc-500">
                    {new Date(conv.last_message_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                  Click to chat
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
