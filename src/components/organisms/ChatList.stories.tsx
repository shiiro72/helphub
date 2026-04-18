import type { Meta, StoryObj } from '@storybook/nextjs';
import { ChatList } from './ChatList';

const meta: Meta<typeof ChatList> = {
  title: 'Organisms/ChatList',
  component: ChatList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChatList>;

const mockConversations = [
  {
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
  },
];

export const Default: Story = {
  args: {
    conversations: mockConversations,
    currentUserId: 'me',
    onSelect: (c) => console.log('Selected', c),
  },
};
