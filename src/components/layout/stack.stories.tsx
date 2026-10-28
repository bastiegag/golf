import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Stack } from './stack';

const meta = {
  title: 'Layout/Stack',
  component: Stack,
  tags: ['autodocs'],
  args: {
    direction: 'vertical',
    gap: 'md',
    align: 'stretch',
    justify: 'start',
    wrap: false,
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Stack {...args}>
      <div className="rounded-md bg-muted p-4">First item</div>
      <div className="rounded-md bg-muted p-4">Second item</div>
      <div className="rounded-md bg-muted p-4">Third item</div>
    </Stack>
  ),
};

export const HorizontalWrapping: Story = {
  args: {
    direction: 'horizontal',
    gap: 'sm',
    wrap: true,
  },
  render: (args) => (
    <Stack {...args}>
      {['One', 'Two', 'Three', 'Four'].map((item) => (
        <div key={item} className="rounded-md bg-muted px-5 py-3">
          {item}
        </div>
      ))}
    </Stack>
  ),
};
