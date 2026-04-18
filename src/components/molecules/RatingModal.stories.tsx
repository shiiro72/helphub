import type { Meta, StoryObj } from '@storybook/nextjs';
import { RatingModal } from './RatingModal';

const meta: Meta<typeof RatingModal> = {
  title: 'Molecules/RatingModal',
  component: RatingModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RatingModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    userName: 'John Doe',
    onClose: () => console.log('Closed'),
    onSubmit: (r, t, c) => console.log(r, t, c),
  },
};
