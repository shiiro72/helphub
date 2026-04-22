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
        className={`max-w-[95%] rounded-lg px-3 py-2 shadow-sm relative ${
          isOwnMessage
            ? 'bg-brand-primary text-brand-on-primary rounded-tr-none'
            : 'bg-brand-surface-container text-brand-text-main rounded-tl-none border border-brand-border'
        }`}
      >
        <p className="text-sm pr-12">{message.content}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className={`text-[10px] uppercase ${isOwnMessage ? 'text-brand-on-primary/70' : 'text-brand-text-secondary'}`}>
            {date}
          </span>
          {isOwnMessage && (
            <span className={message.is_read ? 'text-blue-400' : 'text-brand-on-primary/50'}>
              {message.is_read ? <CheckCheck size={14} /> : <Check size={14} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
