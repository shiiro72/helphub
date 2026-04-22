import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../atoms/Button';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-chat-header px-4 py-3 flex items-center gap-2 border-t border-zinc-200 dark:border-zinc-800"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
        disabled={disabled}
        autoComplete="off"
        className="grow bg-chat-input border-none rounded-lg px-4 py-2 text-sm focus:ring-0 placeholder-zinc-500 text-zinc-900 dark:text-zinc-100"
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        disabled={!message.trim() || disabled}
        className={`${
          message.trim() ? 'text-brand-success' : 'text-zinc-500'
        } hover:bg-transparent`}
      >
        <Send size={24} />
      </Button>
    </form>
  );
};
