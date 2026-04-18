import type { Meta, StoryObj } from '@storybook/nextjs';
import { ProfileSettingsModal } from './ProfileSettingsModal';

const meta: Meta<typeof ProfileSettingsModal> = {
  title: 'Organisms/ProfileSettingsModal',
  component: ProfileSettingsModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProfileSettingsModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Closed'),
  },
};
