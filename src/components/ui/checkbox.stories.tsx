import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Checkbox } from './checkbox';

const meta = {
  title: 'UI/Forms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: {
    name: 'updates',
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  render: (args) => (
    <label className="flex items-center gap-2">
      <Checkbox {...args} aria-label="Receive updates" />
      <span className="text-body-sm">Receive updates</span>
    </label>
  ),
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
  render: (args) => (
    <label className="flex items-center gap-2">
      <Checkbox {...args} aria-label="Receive updates" />
      <span className="text-body-sm">Receive updates</span>
    </label>
  ),
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
  render: (args) => (
    <label className="flex items-center gap-2">
      <Checkbox {...args} aria-label="Select all products" />
      <span className="text-body-sm">Some products selected</span>
    </label>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
  render: (args) => (
    <label className="flex items-center gap-2">
      <Checkbox {...args} aria-label="Receive updates" />
      <span className="text-body-sm">Unavailable option</span>
    </label>
  ),
};
