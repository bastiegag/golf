import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Input } from './input';

const meta = {
  title: 'UI/Forms/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    placeholder: 'Enter a value',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'number', 'password', 'date'],
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <label className="block w-80">
      <span className="mb-2 block text-body-sm font-medium">Name</span>
      <Input {...args} aria-label="Name" />
    </label>
  ),
};

export const Required: Story = {
  args: {
    required: true,
    name: 'email',
    type: 'email',
  },
  render: (args) => (
    <label className="block w-80">
      <span className="mb-2 block text-body-sm font-medium">Email</span>
      <Input {...args} aria-label="Email" />
    </label>
  ),
};

export const Invalid: Story = {
  args: {
    'aria-invalid': true,
    value: 'not-an-email',
    type: 'email',
    readOnly: true,
  },
  render: (args) => (
    <label className="block w-80">
      <span className="mb-2 block text-body-sm font-medium">Email</span>
      <Input {...args} aria-label="Email" />
    </label>
  ),
};

export const DisabledAndReadOnly: Story = {
  render: () => (
    <div className="grid w-80 gap-4">
      <label>
        <span className="mb-2 block text-body-sm font-medium">Disabled</span>
        <Input disabled value="Unavailable" readOnly aria-label="Disabled" />
      </label>
      <label>
        <span className="mb-2 block text-body-sm font-medium">Read only</span>
        <Input value="Cannot be edited" readOnly aria-label="Read only" />
      </label>
    </div>
  ),
};
