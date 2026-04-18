import type { Meta, StoryObj } from '@storybook/nextjs';
import { StarRating } from './StarRating';

const meta: Meta<typeof StarRating> = {
  title: 'Atoms/StarRating',
  component: StarRating,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StarRating>;

export const Default: Story = {
  args: {
    rating: 4.5,
    totalRatings: 12,
    showCount: true,
  },
};
