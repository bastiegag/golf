import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { CartProvider } from '@/features/cart/context';
import { AddToCartButton } from '@/features/cart/components/add-to-cart-button';
import { CartIndicator } from '@/features/cart/components/cart-indicator';
import { CartPage } from '@/features/cart/components/cart-page';
import type { CartProduct } from '@/features/cart/types';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

const product: CartProduct = {
  productId: 'product-1',
  slug: 'harbor-knit',
  name: 'Harbor Knit',
  priceCents: 6800,
  imageUrl: '/products/placeholder.svg',
};

beforeEach(() => {
  window.localStorage.clear();
});
afterEach(cleanup);

function renderWithCart(children: React.ReactNode) {
  return render(<CartProvider>{children}</CartProvider>);
}

describe('cart components', () => {
  it('adds a product and announces transient feedback', async () => {
    const user = userEvent.setup();

    renderWithCart(
      <>
        <AddToCartButton product={product} />
        <CartIndicator />
      </>,
    );

    const addButton = screen.getByRole('button', { name: 'Add to cart' });
    await waitFor(() => expect(addButton).toBeEnabled());
    await user.click(addButton);

    expect(toast.success).toHaveBeenCalledWith(
      'Harbor Knit added to your cart.',
    );
    expect(
      await screen.findByRole('link', { name: 'Cart (1 items)' }),
    ).toBeInTheDocument();
  });

  it('renders quantity controls, subtotal, and remove interaction', async () => {
    const user = userEvent.setup();

    renderWithCart(
      <>
        <AddToCartButton product={product} />
        <CartPage />
      </>,
    );

    const addButton = screen.getByRole('button', { name: 'Add to cart' });
    await waitFor(() => expect(addButton).toBeEnabled());
    await user.click(addButton);
    expect(await screen.findByRole('heading', { name: 'Your cart' })).toBeVisible();
    expect(screen.getAllByText('$68.00').length).toBeGreaterThanOrEqual(1);

    await user.click(
      screen.getByRole('button', { name: 'Increase quantity of Harbor Knit' }),
    );
    expect(screen.getAllByText('$136.00').length).toBeGreaterThanOrEqual(1);

    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.getByRole('heading', { name: 'Your cart' })).toBeVisible();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('disables add to cart at the maximum quantity', async () => {
    const user = userEvent.setup();

    renderWithCart(<AddToCartButton product={product} />);

    const addButton = screen.getByRole('button', { name: 'Add to cart' });
    await waitFor(() => expect(addButton).toBeEnabled());

    for (let index = 0; index < 10; index += 1) {
      await user.click(
        screen.getByRole('button', { name: /Add to cart|Maximum quantity/ }),
      );
    }

    expect(
      screen.getByRole('button', { name: 'Maximum quantity reached' }),
    ).toBeDisabled();
  });
});
