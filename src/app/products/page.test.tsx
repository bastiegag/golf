import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProductsPage from '@/app/products/page';
import {
  getActiveCategories,
  getActiveProducts,
} from '@/features/products/queries/get-products';

afterEach(cleanup);

vi.mock('@/features/products/queries/get-products', () => ({
  getActiveCategories: vi.fn(),
  getActiveProducts: vi.fn(),
}));

const mockedGetActiveCategories = vi.mocked(getActiveCategories);
const mockedGetActiveProducts = vi.mocked(getActiveProducts);

const categories = [
  {
    id: 'category-1',
    name: 'Clothing',
    slug: 'clothing',
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  },
  {
    id: 'category-2',
    name: 'Accessories',
    slug: 'accessories',
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  },
];

const product = {
  id: 'product-1',
  slug: 'harbor-knit',
  name: 'Harbor Knit',
  description: 'A soft, easy layer for cool mornings.',
  price: '68.00',
  imageUrl: '/products/placeholder.svg',
  isActive: true,
  categoryId: 'category-1',
  category: categories[0],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('ProductsPage', () => {
  it('renders all products and the selected category', async () => {
    mockedGetActiveCategories.mockResolvedValue(categories);
    mockedGetActiveProducts.mockResolvedValue([product]);

    render(
      await ProductsPage({
        searchParams: Promise.resolve({ category: 'clothing' }),
      }),
    );

    expect(screen.getByRole('heading', { name: 'Harbor Knit' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Clothing' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(mockedGetActiveProducts).toHaveBeenCalledWith('clothing');
  });

  it('renders a category-specific empty state for unknown categories', async () => {
    mockedGetActiveCategories.mockResolvedValue(categories);
    mockedGetActiveProducts.mockResolvedValue([]);

    render(
      await ProductsPage({
        searchParams: Promise.resolve({ category: 'unknown' }),
      }),
    );

    expect(
      screen.getByText('No products found for this category.'),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: 'All products' })[0],
    ).not.toHaveAttribute('aria-current');
  });

  it('renders the empty catalogue state without a filter', async () => {
    mockedGetActiveCategories.mockResolvedValue(categories);
    mockedGetActiveProducts.mockResolvedValue([]);

    render(await ProductsPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByText(/No products yet\. Connect PostgreSQL/),
    ).toBeInTheDocument();
    expect(mockedGetActiveProducts).toHaveBeenCalledWith(undefined);
  });
});
