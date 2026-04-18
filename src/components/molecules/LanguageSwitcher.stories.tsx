import type { Meta, StoryObj } from '@storybook/nextjs';
import { LanguageSwitcher } from './LanguageSwitcher';

const meta: Meta<typeof LanguageSwitcher> = {
  title: 'Molecules/LanguageSwitcher',
  component: LanguageSwitcher,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LanguageSwitcher>;

export const Desktop: Story = {
  args: {
    variant: 'desktop',
  },
};

export const Mobile: Story = {
  args: {
    variant: 'mobile',
  },
};
