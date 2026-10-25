import { describe, expect, it } from 'vitest';
import { MAX_CART_QUANTITY } from '@/features/cart/constants';
import { cartReducer, initialCartState } from '@/features/cart/reducer';
import type { CartProduct } from '@/features/cart/types';
import {
  calculateItemCount,
  calculateSubtotalCents,
  priceToCents,
} from '@/features/cart/utils';

const product: CartProduct = {
  productId: 'product-1',
  slug: 'harbor-knit',
  name: 'Harbor Knit',
  priceCents: 6899,
  imageUrl: '/products/placeholder.svg',
};

describe('cartReducer', () => {
  it('adds a new product and increases an existing product quantity', () => {
    const added = cartReducer(initialCartState, { type: 'add', product });
    const addedAgain = cartReducer(added, { type: 'add', product });

    expect(added.items).toEqual([{ ...product, quantity: 1 }]);
    expect(addedAgain.items[0].quantity).toBe(2);
  });

  it('caps repeated additions at the maximum quantity', () => {
    let state = initialCartState;

    for (let index = 0; index < MAX_CART_QUANTITY + 2; index += 1) {
      state = cartReducer(state, { type: 'add', product });
    }

    expect(state.items[0].quantity).toBe(MAX_CART_QUANTITY);
  });

  it('removes products and clears the cart', () => {
    const state = { items: [{ ...product, quantity: 2 }] };

    expect(
      cartReducer(state, { type: 'remove', productId: product.productId }),
    ).toEqual(initialCartState);
    expect(cartReducer(state, { type: 'clear' })).toEqual(initialCartState);
  });

  it('updates quantities and rejects invalid values', () => {
    const state = { items: [{ ...product, quantity: 2 }] };

    expect(
      cartReducer(state, {
        type: 'updateQuantity',
        productId: product.productId,
        quantity: 5,
      }).items[0].quantity,
    ).toBe(5);
    expect(
      cartReducer(state, {
        type: 'updateQuantity',
        productId: product.productId,
        quantity: 0,
      }),
    ).toBe(state);
    expect(
      cartReducer(state, {
        type: 'updateQuantity',
        productId: product.productId,
        quantity: MAX_CART_QUANTITY + 1,
      }),
    ).toBe(state);
  });
});

describe('cart calculations', () => {
  it('calculates item count and subtotal in integer cents', () => {
    const items = [
      { ...product, quantity: 2 },
      {
        ...product,
        productId: 'product-2',
        priceCents: 1,
        quantity: 3,
      },
    ];

    expect(calculateItemCount(items)).toBe(5);
    expect(calculateSubtotalCents(items)).toBe(13801);
  });

  it('parses decimal prices without floating-point arithmetic', () => {
    expect(priceToCents('68.99')).toBe(6899);
    expect(priceToCents('18')).toBe(1800);
    expect(priceToCents('0.1')).toBe(10);
    expect(priceToCents('invalid')).toBeNull();
  });
});
