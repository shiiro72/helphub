import type { Meta, StoryObj } from '@storybook/nextjs';
import { RequestBoard } from './RequestBoard';

const meta: Meta<typeof RequestBoard> = {
  title: 'Organisms/RequestBoard',
  component: RequestBoard,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof RequestBoard>;

export const Default: Story = {};
