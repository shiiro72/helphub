import type { Meta, StoryObj } from '@storybook/nextjs';
import { NavLink } from './NavLink';

const meta: Meta<typeof NavLink> = {
  title: 'Molecules/NavLink',
  component: NavLink,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NavLink>;

export const Default: Story = {
  args: {
    href: '/',
    children: 'Home',
  },
};
