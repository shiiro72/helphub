import type { Meta, StoryObj } from '@storybook/nextjs';
import { ChatInput } from './ChatInput';

const meta: Meta<typeof ChatInput> = {
  title: 'Molecules/ChatInput',
  component: ChatInput,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChatInput>;

export const Default: Story = {
  args: {
    onSendMessage: (c) => console.log(c),
  },
};
