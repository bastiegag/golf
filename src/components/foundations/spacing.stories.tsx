import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const spacing = [
  ['1', '0.25rem', 'w-1'],
  ['2', '0.5rem', 'w-2'],
  ['4', '1rem', 'w-4'],
  ['6', '1.5rem', 'w-6'],
  ['8', '2rem', 'w-8'],
  ['12', '3rem', 'w-12'],
  ['16', '4rem', 'w-16'],
] as const;

const meta = {
  title: 'Foundations/Spacing',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  render: () => (
    <div className="space-y-3">
      {spacing.map(([name, value, widthClass]) => (
        <div key={name} className="flex items-center gap-4">
          <div className={`h-6 ${widthClass} shrink-0 rounded-sm bg-primary`} />
          <span className="text-body-sm">
            {name} <span className="text-muted-foreground">({value})</span>
          </span>
        </div>
      ))}
    </div>
  ),
};

export const Controls: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-3">
      {[
        ['Small', 'var(--control-height-sm)'],
        ['Medium', 'var(--control-height-md)'],
        ['Large', 'var(--control-height-lg)'],
      ].map(([label, value]) => (
        <div key={label} className="space-y-2">
          <div
            className="rounded-md bg-secondary"
            style={{ height: value }}
          />
          <p className="text-body-sm">
            {label}: {value}
          </p>
        </div>
      ))}
    </div>
  ),
};
