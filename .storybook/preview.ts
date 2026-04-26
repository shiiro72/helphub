import React from 'react';
import type { Preview } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../messages/en.json';
import '../src/styles/globals.css';
import { ToastProvider } from '../src/lib/contexts/ToastContext';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  decorators: [
    (Story) =>
      React.createElement(NextIntlClientProvider, {
        locale: 'en',
        messages,
        children: React.createElement(ToastProvider, {
          children: React.createElement(Story),
        }),
      }),
  ],
};

export default preview;
