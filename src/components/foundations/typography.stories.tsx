import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Foundations/Typography',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  render: () => (
    <div className="space-y-6">
      <p className="text-display font-medium">Display</p>
      <p className="text-heading-1 font-medium">Heading 1</p>
      <p className="text-heading-2 font-medium">Heading 2</p>
      <p className="text-heading-3 font-medium">Heading 3</p>
      <p className="text-body">Body text for everyday reading and interface content.</p>
      <p className="text-body-sm">Small body text for supporting information.</p>
      <p className="text-caption uppercase tracking-wide">Caption and metadata</p>
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <div className="space-y-3 text-body">
      <p className="font-normal">Normal 400</p>
      <p className="font-medium">Medium 500</p>
      <p className="font-semibold">Semibold 600</p>
      <p className="font-bold">Bold 700</p>
    </div>
  ),
};
