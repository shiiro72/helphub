import type { Meta, StoryObj } from '@storybook/nextjs';
import { VerificationBadge } from './VerificationBadge';

const meta: Meta<typeof VerificationBadge> = {
  title: 'Atoms/VerificationBadge',
  component: VerificationBadge,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VerificationBadge>;

export const Default: Story = {
  args: {
    isVerified: true,
    size: 16,
  },
};
