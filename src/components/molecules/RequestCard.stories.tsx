import type { Meta, StoryObj } from '@storybook/nextjs';
import { RequestCard } from './RequestCard';

const meta: Meta<typeof RequestCard> = {
  title: 'Molecules/RequestCard',
  component: RequestCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RequestCard>;

const mockRequest = {
  id: '1',
  user_id: 'user1',
  title: 'Need help moving a sofa',
  content:
    'I recently bought a sofa and need help moving it to my apartment on the 3rd floor. It is quite heavy, so I need someone with strength.',
  image_url: null,
  reward_offer: 'Pizza and drinks',
  request_location: 'Downtown Brooklyn',
  date_posted: new Date().toISOString(),
  profiles: {
    id: 'user1',
    username: 'john_doe',
    is_verified: true,
    image_url: null,
    trust_rank: 4.5,
    total_ratings: 10,
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

export const UnverifiedUser: Story = {
  args: {
    request: {
      ...mockRequest,
      profiles: {
        ...mockRequest.profiles,
        is_verified: false,
      },
    },
  },
};

export const RemoteRequest: Story = {
  args: {
    request: {
      ...mockRequest,
      request_location: null,
    },
  },
};
