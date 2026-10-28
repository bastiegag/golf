import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Foundations/Radius & Shadows',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Radius: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-4">
      {[
        ['sm', 'rounded-sm'],
        ['md', 'rounded-md'],
        ['lg', 'rounded-lg'],
        ['full', 'rounded-full'],
      ].map(([radius, radiusClass]) => (
        <div key={radius} className="space-y-2 text-center">
          <div className={`h-20 ${radiusClass} bg-primary`} />
          <p className="text-body-sm">radius-{radius}</p>
        </div>
      ))}
    </div>
  ),
};

export const Shadows: Story = {
  render: () => (
    <div className="grid gap-6 sm:grid-cols-3">
      {[
        ['sm', 'shadow-sm'],
        ['md', 'shadow-md'],
        ['lg', 'shadow-lg'],
      ].map(([shadow, shadowClass]) => (
        <div key={shadow} className="space-y-2 text-center">
          <div className={`h-24 rounded-md bg-surface ${shadowClass}`} />
          <p className="text-body-sm">shadow-{shadow}</p>
        </div>
      ))}
    </div>
  ),
};
