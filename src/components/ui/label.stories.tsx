import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Input } from './input';
import { Label } from './label';

const meta = {
  title: 'UI/Forms/Label',
  component: Label,
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <Label {...args} htmlFor="label-example">
        Product name
      </Label>
      <Input id="label-example" className="mt-2" />
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="w-80">
      <Label htmlFor="required-example">Email address</Label>
      <Input
        id="required-example"
        name="email"
        type="email"
        required
        className="mt-2"
      />
    </div>
  ),
};
