import type { Meta, StoryObj } from '@storybook/nextjs';
import { TriangularBoard } from './TriangularBoard';
import { HelpRequest, HelpOffer } from '@/lib/types';

const meta: Meta<typeof TriangularBoard> = {
  title: 'Organisms/TriangularBoard',
  component: TriangularBoard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-8 bg-brand-background min-h-screen">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TriangularBoard>;

const mockProfile = {
  id: 'user1',
  username: 'john_doe',
  is_verified: true,
  image_url: null,
  trust_rank: 4.5,
  total_ratings: 10,
  created_at: new Date().toISOString(),
  role: 'user' as const,
  is_restricted: false,
};

const mockRequests: HelpRequest[] = [
  {
    id: '1',
    user_id: 'user1',
    title: 'Need help moving a sofa',
    content: 'I recently bought a sofa and need help moving it to my apartment on the 3rd floor.',
    date_posted: new Date().toISOString(),
    profiles: mockProfile,
    city: 'Brooklyn',
    address: 'Downtown',
  },
  {
    id: '2',
    user_id: 'user2',
    title: 'Grocery shopping help',
    content: 'I need someone to help me with grocery shopping this weekend.',
    date_posted: new Date().toISOString(),
    profiles: { ...mockProfile, username: 'jane_doe', id: 'user2' },
    city: 'Manhattan',
    address: 'Upper East Side',
  },
  {
    id: '3',
    user_id: 'user3',
    title: 'Dog walking',
    content: 'Looking for someone to walk my dog while I am at work.',
    date_posted: new Date().toISOString(),
    profiles: { ...mockProfile, username: 'dog_lover', id: 'user3' },
    city: 'Queens',
    address: 'Astoria',
  },
];

const mockOffers: HelpOffer[] = [
  {
    id: 'o1',
    user_id: 'user4',
    title: 'Free coding lessons',
    content: 'I can teach you React and Next.js for free. Let me know if you are interested!',
    date_posted: new Date().toISOString(),
    profiles: { ...mockProfile, username: 'code_master', id: 'user4' },
    city: 'Remote',
  },
  {
    id: 'o2',
    user_id: 'user5',
    title: 'Gardening assistance',
    content: 'I love gardening and I can help you with your garden this spring.',
    date_posted: new Date().toISOString(),
    profiles: { ...mockProfile, username: 'green_thumb', id: 'user5' },
    city: 'Bronx',
    address: 'Little Italy',
  },
  {
    id: 'o3',
    user_id: 'user6',
    title: 'Guitar lessons',
    content: 'Offering free guitar lessons for beginners.',
    date_posted: new Date().toISOString(),
    profiles: { ...mockProfile, username: 'guitar_hero', id: 'user6' },
    city: 'Staten Island',
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
