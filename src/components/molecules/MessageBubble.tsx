import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { Message } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const date = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex w-full mb-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg px-3 py-2 shadow-sm relative ${
          isOwnMessage
            ? 'bg-chat-bubble-sent text-zinc-900 dark:text-zinc-100 rounded-tr-none'
            : 'bg-chat-bubble-received text-zinc-900 dark:text-zinc-100 rounded-tl-none'
        }`}
      >
        <p className="text-sm pr-12">{message.content}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase">
            {date}
          </span>
          {isOwnMessage && (
            <span className={message.is_read ? 'text-brand-info' : 'text-zinc-400'}>
              {message.is_read ? <CheckCheck size={14} /> : <Check size={14} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
