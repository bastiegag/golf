import { CheckCircle, ShoppingCart, Trash2, TriangleAlert } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Icon } from './icon';

const meta = {
  title: 'UI/Display/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: {
    icon: ShoppingCart,
    size: 'md',
    color: 'current',
  },
  argTypes: {
    icon: { control: false },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    color: {
      control: 'select',
      options: ['current', 'muted', 'success', 'warning', 'destructive', 'info'],
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Icon key={size} icon={ShoppingCart} size={size} />
      ))}
    </div>
  ),
};

export const SemanticColors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon icon={CheckCircle} color="success" aria-label="Success" />
      <Icon icon={TriangleAlert} color="warning" aria-label="Warning" />
      <Icon icon={Trash2} color="destructive" aria-label="Destructive" />
    </div>
  ),
};

export const WithAdjacentText: Story = {
  render: () => (
    <p className="flex items-center gap-2 text-body-sm">
      <Icon icon={ShoppingCart} aria-hidden="true" />
      Your cart is ready
    </p>
  ),
};

export const AccessibleIcon: Story = {
  args: {
    icon: TriangleAlert,
    color: 'warning',
    'aria-label': 'Warning',
  },
};
