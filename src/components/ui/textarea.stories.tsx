import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Textarea } from './textarea';

const meta = {
  title: 'UI/Forms/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: {
    placeholder: 'Write a message',
    rows: 4,
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <label className="block w-96">
      <span className="mb-2 block text-body-sm font-medium">Message</span>
      <Textarea {...args} aria-label="Message" />
    </label>
  ),
};

export const WithDescription: Story = {
  render: (args) => (
    <div className="w-96">
      <label className="block">
        <span className="mb-2 block text-body-sm font-medium">Bio</span>
        <Textarea
          {...args}
          aria-describedby="bio-description"
          aria-label="Bio"
        />
      </label>
      <p id="bio-description" className="mt-2 text-body-sm text-muted-foreground">
        Keep this under 240 characters.
      </p>
    </div>
  ),
};

export const Invalid: Story = {
  args: {
    'aria-invalid': true,
  },
  render: (args) => (
    <label className="block w-96">
      <span className="mb-2 block text-body-sm font-medium">Message</span>
      <Textarea {...args} aria-label="Message" />
    </label>
  ),
};
