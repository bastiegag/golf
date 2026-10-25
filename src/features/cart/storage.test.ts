import { describe, expect, it } from 'vitest';
import { CART_STORAGE_KEY } from '@/features/cart/constants';
import { loadCartItems, saveCartItems } from '@/features/cart/storage';
import type { CartItem } from '@/features/cart/types';

function createStorage() {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() {
      return values.size;
    },
  } as Storage;
}

const item: CartItem = {
  productId: 'product-1',
  slug: 'harbor-knit',
  name: 'Harbor Knit',
  priceCents: 6800,
  imageUrl: '/products/placeholder.svg',
  quantity: 1,
};

describe('cart persistence', () => {
  it('saves and restores valid versioned data', () => {
    const storage = createStorage();

    saveCartItems([item], storage);

    expect(loadCartItems(storage)).toEqual([item]);
    expect(storage.getItem(CART_STORAGE_KEY)).toContain('"version":1');
  });

  it.each([
    ['missing data', null],
    ['invalid JSON', '{invalid'],
    ['unsupported version', JSON.stringify({ version: 2, items: [item] })],
    ['corrupt item', JSON.stringify({ version: 1, items: [{ ...item, quantity: 0 }] })],
  ])('returns an empty cart for %s', (_, value) => {
    const storage = createStorage();

    if (value !== null) {
      storage.setItem(CART_STORAGE_KEY, value);
    }

    expect(loadCartItems(storage)).toEqual([]);
  });

  it('does not require browser storage during server rendering', () => {
    expect(loadCartItems(null)).toEqual([]);
  });
});
