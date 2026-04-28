import type { Meta, StoryObj } from '@storybook/nextjs';
import { ChatList } from './ChatList';
import { Conversation } from '@/lib/types';

const mockConversations: Conversation[] = [
  {
    id: '1',
    participant_1: 'me',
    participant_2: 'user1',
    is_group: false,
    title: null,
    request_id: null,
    last_message_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    profiles: {
      id: 'user1',
      username: 'john_doe',
      is_verified: true,
      image_url: null,
      created_at: new Date().toISOString(),
      role: 'user' as const,
      is_restricted: false,
    },
  },
  {
    id: '2',
    participant_1: 'me',
    participant_2: 'user2',
    is_group: false,
    title: null,
    request_id: null,
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString(),
    profiles: {
      id: 'user2',
      username: 'jane_smith',
      is_verified: false,
      image_url: null,
      created_at: new Date().toISOString(),
      role: 'user' as const,
      is_restricted: false,
    },
  },
];

const meta: Meta<typeof ChatList> = {
  title: 'Organisms/ChatList',
  component: ChatList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChatList>;

export const Default: Story = {
  args: {
    conversations: mockConversations,
    onSelect: (c) => console.log('Selected', c),
  },
};

export const ActiveChat: Story = {
  args: {
    conversations: mockConversations,
    activeId: '1',
    onSelect: (c) => console.log('Selected', c),
  },
};

export const Empty: Story = {
  args: {
    conversations: [],
    onSelect: (c) => console.log('Selected', c),
  },
};
