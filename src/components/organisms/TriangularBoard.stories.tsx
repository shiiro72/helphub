import type { Meta, StoryObj } from '@storybook/react';
import { TriangularBoard } from './TriangularBoard';
import { HelpRequest, HelpOffer } from '@/lib/types';

const meta: Meta<typeof TriangularBoard> = {
  title: 'Organisms/TriangularBoard',
  component: TriangularBoard,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TriangularBoard>;

const mockRequests: HelpRequest[] = [
  {
    id: '1',
    title: 'Need help with groceries',
    content: 'I am unable to go out and need some basic groceries like milk, bread, and eggs.',
    city: 'Cluj-Napoca',
    country: 'Romania',
    address: 'Strada Universității 1',
    reward_offer: 'Freshly baked cookies',
    start_datetime: '2026-04-21T10:00:00Z',
    end_datetime: '2026-04-21T12:00:00Z',
    date_posted: '2026-04-20T08:00:00Z',
    user_id: 'user1',
    profiles: {
      username: 'Alice',
      full_name: 'Alice Smith',
      avatar_url: null,
      rating: 4.8,
      total_reviews: 12,
      is_verified: true,
    },
  },
  {
    id: '2',
    title: 'Walking the dog',
    content: 'Looking for someone to walk my dog Buddy for 30 minutes in the afternoon.',
    city: 'Cluj-Napoca',
    country: 'Romania',
    address: 'Parcul Central',
    start_datetime: '2026-04-21T15:00:00Z',
    end_datetime: '2026-04-21T15:30:00Z',
    date_posted: '2026-04-20T09:00:00Z',
    user_id: 'user2',
    profiles: {
      username: 'Bob',
      full_name: 'Bob Johnson',
      avatar_url: null,
      rating: 4.2,
      total_reviews: 5,
    },
  },
];

const mockOffers: HelpOffer[] = [
  {
    id: '3',
    title: 'Can help with gardening',
    content: 'I have experience with pruning and planting. Happy to help with your garden!',
    city: 'Cluj-Napoca',
    country: 'Romania',
    address: 'Anywhere in the city',
    start_datetime: '2026-04-21T09:00:00Z',
    end_datetime: '2026-04-21T17:00:00Z',
    date_posted: '2026-04-20T07:00:00Z',
    user_id: 'user3',
    profiles: {
      username: 'Diana',
      full_name: 'Diana Prince',
      avatar_url: null,
      rating: 4.9,
      total_reviews: 18,
      is_verified: true,
    },
  },
  {
    id: '4',
    title: 'Free language exchange',
    content: 'Native Spanish speaker offering English-Spanish conversation practice.',
    city: 'Cluj-Napoca',
    country: 'Romania',
    address: 'Online or in a cafe',
    start_datetime: '2026-04-21T18:00:00Z',
    end_datetime: '2026-04-21T20:00:00Z',
    date_posted: '2026-04-20T10:00:00Z',
    user_id: 'user4',
    profiles: {
      username: 'Elena',
      full_name: 'Elena Rodriguez',
      avatar_url: null,
      rating: 4.5,
      total_reviews: 8,
    },
  },
];

export const Default: Story = {
  args: {
    requests: mockRequests,
    offers: mockOffers,
  },
};

export const Loading: Story = {
  args: {
    requests: [],
    offers: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    requests: [],
    offers: [],
  },
};

export const OnlyRequests: Story = {
  args: {
    requests: mockRequests,
    offers: [],
  },
};

export const OnlyOffers: Story = {
  args: {
    requests: [],
    offers: mockOffers,
  },
};
