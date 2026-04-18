import type { Meta, StoryObj } from '@storybook/nextjs';
import { ConfirmationModal } from './ConfirmationModal';

const meta: Meta<typeof ConfirmationModal> = {
  title: 'Molecules/ConfirmationModal',
  component: ConfirmationModal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConfirmationModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed with this action?',
    onClose: () => console.log('Closed'),
    onConfirm: () => console.log('Confirmed'),
  },
};
