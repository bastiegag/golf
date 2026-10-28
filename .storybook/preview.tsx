import { useEffect } from 'react';
import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/globals.css';

function ThemeDecorator({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: string;
}) {
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');

    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [theme]);

  return (
    <div
      className={theme === 'dark' ? 'dark min-h-screen bg-background text-foreground' : 'min-h-screen bg-background text-foreground'}
    >
      {children}
    </div>
  );
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Design system theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => (
      <ThemeDecorator theme={context.globals.theme}>
        <Story />
      </ThemeDecorator>
    ),
  ],
  parameters: {
    a11y: {
      test: 'error',
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
