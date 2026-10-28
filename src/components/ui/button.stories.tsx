import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from './button';

const meta = {
  title: 'UI/Actions/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Continue',
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive'],
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Secondary action',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary action',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Low emphasis action',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete item',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Unavailable',
  },
};

export const LongLabel: Story = {
  args: {
    children: 'Save changes and return to the order overview',
  },
};

export const AsLink: Story = {
  args: {
    asChild: true,
  },
  render: (args) => (
    <Button {...args}>
      <a href="#button-story">Open linked destination</a>
    </Button>
  ),
};
