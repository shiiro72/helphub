import type { Meta, StoryObj } from '@storybook/nextjs';
import { AuthForm } from './AuthForm';

const meta: Meta<typeof AuthForm> = {
  title: 'Organisms/AuthForm',
  component: AuthForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AuthForm>;

export const Login: Story = {
  args: {
    mode: 'login',
  },
};

export const Register: Story = {
  args: {
    mode: 'register',
  },
};
