import type { Meta, StoryObj } from '@storybook/nextjs';
import { ChatWindow } from './ChatWindow';

const meta: Meta<typeof ChatWindow> = {
  title: 'Organisms/ChatWindow',
  component: ChatWindow,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChatWindow>;

const mockConversation = {
  id: '1',
  participant_1: 'me',
  participant_2: 'user1',
  last_message_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  profiles: {
    id: 'user1',
    username: 'john_doe',
    is_verified: true,
    image_url: null,
    trust_rank: 4.5,
    total_ratings: 10,
    created_at: new Date().toISOString(),
  },
};

export const Default: Story = {
  args: {
    conversation: mockConversation,
    currentUserId: 'me',
    onSendMessage: (c) => console.log('Send', c),
    onBlock: (id) => console.log('Block', id),
    onReport: (id) => console.log('Report', id),
  },
};
