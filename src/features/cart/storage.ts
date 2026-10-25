import { z } from 'zod';
import { CART_STORAGE_KEY, MAX_CART_QUANTITY } from './constants';
import type { CartItem } from './types';

const cartItemSchema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  priceCents: z.number().int().nonnegative(),
  imageUrl: z.string().startsWith('/'),
  quantity: z.number().int().min(1).max(MAX_CART_QUANTITY),
});

const storedCartSchema = z.object({
  version: z.literal(1),
  items: z.array(cartItemSchema),
});

function getBrowserStorage() {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export function loadCartItems(storage?: Storage | null): CartItem[] {
  const targetStorage =
    storage === undefined ? getBrowserStorage() : storage;

  if (!targetStorage) {
    return [];
  }

  try {
    const rawCart = targetStorage.getItem(CART_STORAGE_KEY);

    if (!rawCart) {
      return [];
    }

    const parsed = storedCartSchema.safeParse(JSON.parse(rawCart));
    return parsed.success ? parsed.data.items : [];
  } catch {
    return [];
  }
}

export function saveCartItems(
  items: CartItem[],
  storage?: Storage | null,
) {
  const targetStorage =
    storage === undefined ? getBrowserStorage() : storage;

  if (!targetStorage) {
    return;
  }

  targetStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify({ version: 1, items }),
  );
}
