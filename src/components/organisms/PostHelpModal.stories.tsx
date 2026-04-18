import type { Meta, StoryObj } from '@storybook/nextjs';
import { PostHelpModal } from './PostHelpModal';

const meta: Meta<typeof PostHelpModal> = {
  title: 'Organisms/PostHelpModal',
  component: PostHelpModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PostHelpModal>;

export const Request: Story = {
  args: {
    isOpen: true,
    type: 'request',
    onClose: () => console.log('Closed'),
    onSuccess: () => console.log('Success'),
  },
};
