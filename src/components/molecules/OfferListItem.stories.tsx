import type { Meta, StoryObj } from '@storybook/nextjs';
import { OfferListItem } from './OfferListItem';

const meta: Meta<typeof OfferListItem> = {
  title: 'Molecules/OfferListItem',
  component: OfferListItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OfferListItem>;

const mockOffer = {
  id: '1',
  user_id: 'user1',
  title: 'I can help with grocery shopping',
  content: 'I have a car and can help you with your weekly grocery shopping. I am available on weekends.',
  image_url: null,
  offer_location: 'Downtown Brooklyn',
  date_posted: new Date().toISOString(),
  profiles: {
    id: 'user1',
    username: 'jane_doe',
    is_verified: true,
    image_url: null,
    trust_rank: 4.8,
    total_ratings: 15,
    created_at: new Date().toISOString(),
  },
};

export const Default: Story = {
  args: {
    offer: mockOffer,
  },
};
