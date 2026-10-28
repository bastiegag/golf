import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Container } from './container';

const meta = {
  title: 'Layout/Container',
  component: Container,
  tags: ['autodocs'],
  args: {
    size: 'xl',
    padding: 'md',
    centered: true,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    centered: { control: 'boolean' },
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Container {...args}>
      <div className="rounded-md border border-border bg-surface p-6 shadow-sm">
        The container keeps content aligned to a predictable maximum width.
      </div>
    </Container>
  ),
};

export const Narrow: Story = {
  args: {
    size: 'sm',
    padding: 'sm',
  },
  render: (args) => (
    <Container {...args}>
      <div className="rounded-md border border-border bg-surface p-6 shadow-sm">
        A narrow reading width for focused content.
      </div>
    </Container>
  ),
};
