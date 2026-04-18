import type { Meta, StoryObj } from '@storybook/nextjs';
import { MessageBubble } from './MessageBubble';

const meta: Meta<typeof MessageBubble> = {
  title: 'Molecules/MessageBubble',
  component: MessageBubble,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MessageBubble>;

const mockMessage = {
  id: '1',
  conversation_id: 'conv1',
  sender_id: 'user1',
  content: 'Hello, how can I help you today?',
  is_read: false,
  created_at: new Date().toISOString(),
};

export const Received: Story = {
  args: {
    message: mockMessage,
    isOwnMessage: false,
  },
};
