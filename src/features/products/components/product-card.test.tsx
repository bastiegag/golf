import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductCard } from '@/features/products/components/product-card';

describe('ProductCard', () => {
  it('renders the product name, description, and formatted price', () => {
    render(
      <ProductCard
        product={{
          slug: 'harbor-knit',
          name: 'Harbor Knit',
          description: 'A soft, easy layer for cool mornings.',
          price: '68.00',
          imageUrl: '/products/placeholder.svg',
        }}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Harbor Knit' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('A soft, easy layer for cool mornings.'),
    ).toBeInTheDocument();
    expect(screen.getByText('$68.00')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Harbor Knit' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Harbor Knit/ }),
    ).toHaveAttribute('href', '/products/harbor-knit');
  });
});
