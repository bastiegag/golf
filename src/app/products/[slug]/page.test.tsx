import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProductPage, {
  generateMetadata,
} from '@/app/products/[slug]/page';
import { getActiveProductBySlug } from '@/features/products/queries/get-product';

vi.mock('@/features/products/queries/get-product', () => ({
  getActiveProductBySlug: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

const mockedGetActiveProductBySlug = vi.mocked(getActiveProductBySlug);

const product = {
  id: 'product-1',
  slug: 'harbor-knit',
  name: 'Harbor Knit',
  description: 'A soft, easy layer for cool mornings.',
  price: '68.00',
  imageUrl: '/products/harbor-knit.svg',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('ProductPage', () => {
  it('renders product information and catalogue navigation', async () => {
    mockedGetActiveProductBySlug.mockResolvedValue(product);

    render(await ProductPage({ params: Promise.resolve({ slug: product.slug }) }));

    expect(
      screen.getByRole('heading', { name: 'Harbor Knit' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('A soft, easy layer for cool mornings.'),
    ).toBeInTheDocument();
    expect(screen.getByText('$68.00')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Harbor Knit' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '← Back to the collection' }),
    ).toHaveAttribute('href', '/products');
  });

  it('uses the product name and description for metadata', async () => {
    mockedGetActiveProductBySlug.mockResolvedValue(product);

    await expect(
      generateMetadata({ params: Promise.resolve({ slug: product.slug }) }),
    ).resolves.toMatchObject({
      title: 'Harbor Knit',
      description: 'A soft, easy layer for cool mornings.',
    });
  });

  it('renders not found for an unavailable product', async () => {
    mockedGetActiveProductBySlug.mockResolvedValue(null);

    await expect(
      ProductPage({ params: Promise.resolve({ slug: 'unavailable' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });
});
