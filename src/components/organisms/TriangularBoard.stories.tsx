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
    user_id: 'user1',
    title: 'Need help with groceries',
    content: 'I am unable to go out and need some basic groceries like milk, bread, and eggs.',
    image_url: null,
    reward_offer: 'Freshly baked cookies',
    request_location: 'Downtown',
    city: 'Cluj-Napoca',
    date_posted: new Date().toISOString(),
    profiles: {
      id: 'user1',
      username: 'Alice',
      is_verified: true,
      image_url: null,
      role: 'user',
      is_restricted: false,
      trust_rank: 4.5,
      total_ratings: 12,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: '2',
    user_id: 'user2',
    title: 'Walking the dog',
    content: 'Looking for someone to walk my dog Buddy for 30 minutes in the afternoon.',
    image_url: null,
    reward_offer: null,
    request_location: 'Gheorgheni',
    city: 'Cluj-Napoca',
    date_posted: new Date().toISOString(),
    profiles: {
      id: 'user2',
      username: 'Bob',
      is_verified: false,
      image_url: null,
      role: 'user',
      is_restricted: false,
      trust_rank: 3.8,
      total_ratings: 5,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: '3',
    user_id: 'user3',
    title: 'Math tutoring',
    content: 'My son needs help with 8th grade math, specifically geometry.',
    image_url: null,
    reward_offer: 'Small fee or exchange for yoga lessons',
    request_location: 'Manastur',
    city: 'Cluj-Napoca',
    date_posted: new Date().toISOString(),
    profiles: {
      id: 'user3',
      username: 'Charlie',
      is_verified: true,
      image_url: null,
      role: 'user',
      is_restricted: false,
      trust_rank: 4.9,
      total_ratings: 25,
      created_at: new Date().toISOString(),
    },
  },
];

const mockOffers: HelpOffer[] = [
  {
    id: 'o1',
    user_id: 'user4',
    title: 'Can help with gardening',
    content: 'I have experience with pruning and planting. Happy to help with your garden!',
    image_url: null,
    offer_location: 'Zorilor',
    city: 'Cluj-Napoca',
    date_posted: new Date().toISOString(),
    profiles: {
      id: 'user4',
      username: 'Diana',
      is_verified: true,
      image_url: null,
      role: 'user',
      is_restricted: false,
      trust_rank: 4.7,
      total_ratings: 18,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'o2',
    user_id: 'user5',
    title: 'Free language exchange',
    content: 'Native Spanish speaker offering English-Spanish conversation practice.',
    image_url: null,
    offer_location: 'Center',
    city: 'Cluj-Napoca',
    date_posted: new Date().toISOString(),
    profiles: {
      id: 'user5',
      username: 'Elena',
      is_verified: false,
      image_url: null,
      role: 'user',
      is_restricted: false,
      trust_rank: 4.2,
      total_ratings: 8,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'o3',
    user_id: 'user6',
    title: 'IT support',
    content: 'Can help with computer setup, software installation or troubleshooting.',
    image_url: null,
    offer_location: 'Marasti',
    city: 'Cluj-Napoca',
    date_posted: new Date().toISOString(),
    profiles: {
      id: 'user6',
      username: 'Frank',
      is_verified: true,
      image_url: null,
      role: 'user',
      is_restricted: false,
      trust_rank: 5.0,
      total_ratings: 30,
      created_at: new Date().toISOString(),
    },
  },
];

export const Default: Story = {
  args: {
    requests: mockRequests,
    offers: mockOffers,
  },
};
