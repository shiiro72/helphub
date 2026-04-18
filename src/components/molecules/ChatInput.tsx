import React, { useState } from 'react';
import { Send, Smile } from 'lucide-react';
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
      className="bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-3 flex items-center gap-2 border-t border-zinc-200 dark:border-zinc-800"
    >
      <button
        type="button"
        className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <Smile size={24} />
      </button>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
        disabled={disabled}
        className="flex-grow bg-white dark:bg-[#2a3942] border-none rounded-lg px-4 py-2 text-sm focus:ring-0 placeholder-zinc-500 text-zinc-900 dark:text-zinc-100"
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        disabled={!message.trim() || disabled}
        className={`${
          message.trim() ? 'text-[#00a884]' : 'text-zinc-500'
        } hover:bg-transparent`}
      >
        <Send size={24} />
      </Button>
    </form>
  );
};
