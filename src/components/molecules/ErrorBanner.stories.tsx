import type { Meta, StoryObj } from '@storybook/nextjs';
import { ErrorBanner } from './ErrorBanner';

const meta: Meta<typeof ErrorBanner> = {
  title: 'Molecules/ErrorBanner',
  component: ErrorBanner,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorBanner>;

export const Default: Story = {
  args: {
    message: 'Something went wrong. Please try again later.',
  },
};
