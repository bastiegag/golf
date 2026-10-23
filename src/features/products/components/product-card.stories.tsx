import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProductCard } from './product-card';

const meta = {
  title: 'Products/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HarborKnit: Story = {
  args: {
    product: {
      slug: 'harbor-knit',
      name: 'Harbor Knit',
      description: 'A soft, easy layer for cool mornings.',
      price: '68.00',
      imageUrl: '/products/placeholder.svg',
    },
  },
};
