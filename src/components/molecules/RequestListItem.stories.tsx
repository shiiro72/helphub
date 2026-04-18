import type { Meta, StoryObj } from '@storybook/nextjs';
import { RequestListItem } from './RequestListItem';

const meta: Meta<typeof RequestListItem> = {
  title: 'Molecules/RequestListItem',
  component: RequestListItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RequestListItem>;

const mockRequest = {
  id: '1',
  user_id: 'user1',
  title: 'Need help moving a sofa',
  content: 'I recently bought a sofa and need help moving it to my apartment on the 3rd floor. It is quite heavy, so I need someone with strength.',
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
  },
};

export const Default: Story = {
  args: {
    request: mockRequest,
  },
};

export const LongContent: Story = {
  args: {
    request: {
      ...mockRequest,
      content: 'This is a very long content that should be truncated in the list view to maintain a clean appearance. We want to make sure the layout remains consistent even with large amounts of text.',
    },
  },
};
