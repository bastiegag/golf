import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup } from '@testing-library/react';
import { CategoryFilter } from '@/features/products/components/category-filter';

afterEach(cleanup);

const categories = [
  { name: 'Clothing', slug: 'clothing' },
  { name: 'Accessories', slug: 'accessories' },
];

describe('CategoryFilter', () => {
  it('links to all products and each category', () => {
    render(<CategoryFilter categories={categories} />);

    expect(screen.getByRole('link', { name: 'All products' })).toHaveAttribute(
      'href',
      '/products',
    );
    expect(screen.getByRole('link', { name: 'Clothing' })).toHaveAttribute(
      'href',
      '/products?category=clothing',
    );
  });

  it('marks the selected category and leaves all products inactive', () => {
    render(
      <CategoryFilter
        categories={categories}
        selectedCategory="clothing"
      />,
    );

    const filter = screen.getByRole('navigation', {
      name: 'Filter products by category',
    });
    expect(within(filter).getByRole('link', { name: 'Clothing' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      within(filter).getByRole('link', { name: 'All products' }),
    ).not.toHaveAttribute('aria-current');
  });

  it('does not mark all products for an invalid category', () => {
    render(
      <CategoryFilter
        categories={categories}
        isInvalidCategory
      />,
    );

    expect(
      screen.getByRole('link', { name: 'All products' }),
    ).not.toHaveAttribute('aria-current');
  });
});
