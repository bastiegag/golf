import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Select } from './select';

const meta = {
  title: 'UI/Forms/Select',
  component: Select,
  tags: ['autodocs'],
  args: {
    defaultValue: '',
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const Options = () => (
  <>
    <option value="">Choose a category</option>
    <option value="clothing">Clothing</option>
    <option value="accessories">Accessories</option>
    <option value="stationery">Stationery</option>
  </>
);

export const Default: Story = {
  render: (args) => (
    <label className="block w-80">
      <span className="mb-2 block text-body-sm font-medium">Category</span>
      <Select {...args} aria-label="Category">
        <Options />
      </Select>
    </label>
  ),
};

export const Invalid: Story = {
  args: {
    'aria-invalid': true,
  },
  render: (args) => (
    <label className="block w-80">
      <span className="mb-2 block text-body-sm font-medium">Category</span>
      <Select {...args} aria-label="Category">
        <Options />
      </Select>
    </label>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'clothing',
  },
  render: (args) => (
    <label className="block w-80">
      <span className="mb-2 block text-body-sm font-medium">Category</span>
      <Select {...args} aria-label="Category">
        <Options />
      </Select>
    </label>
  ),
};
