import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from '@/app/page';

describe('HomePage', () => {
  it('shows the storefront hero and a path to the collection', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { name: 'Good things, made to be kept.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Explore the collection' }),
    ).toHaveAttribute('href', '/products');
  });
});
