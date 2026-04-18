import type { Meta, StoryObj } from '@storybook/nextjs';
import { OfferBoard } from './OfferBoard';

const meta: Meta<typeof OfferBoard> = {
  title: 'Organisms/OfferBoard',
  component: OfferBoard,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof OfferBoard>;

export const Default: Story = {};
