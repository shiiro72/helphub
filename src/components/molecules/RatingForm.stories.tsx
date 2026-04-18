import type { Meta, StoryObj } from '@storybook/nextjs';
import { RatingForm } from './RatingForm';

const meta: Meta<typeof RatingForm> = {
  title: 'Molecules/RatingForm',
  component: RatingForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RatingForm>;

export const Default: Story = {
  args: {
    onSubmit: (r, t, c) => console.log(r, t, c),
    onCancel: () => console.log('Cancelled'),
  },
};
