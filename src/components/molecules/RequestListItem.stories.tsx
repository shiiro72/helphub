import type { Meta, StoryObj } from '@storybook/nextjs';
import { RequestListItem } from './RequestListItem';

const meta: Meta<typeof RequestListItem> = {
  title: 'Molecules/RequestListItem',
  component: RequestListItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RequestListItem>;

const mockRequest = {
  id: '1',
  user_id: 'user1',
  title: 'Need help moving a sofa',
  content: 'I recently bought a sofa and need help moving it to my apartment on the 3rd floor.',
  image_url: null,
  reward_offer: 'Pizza and drinks',
  request_location: 'Downtown Brooklyn',
  date_posted: new Date().toISOString(),
  profiles: {
    id: 'user1',
    username: 'john_doe',
    is_verified: true,
    image_url: null,
    created_at: new Date().toISOString(),
    role: 'user' as const,
    is_restricted: false,
  },
};

export const Default: Story = {
  args: {
    request: mockRequest,
  },
};
