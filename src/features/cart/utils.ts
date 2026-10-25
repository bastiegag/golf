import { formatPrice } from '@/features/products/utils/format-price';
import type { CartItem } from './types';

export function isPositiveInteger(value: number) {
  return Number.isInteger(value) && value > 0;
}

export function calculateItemCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function calculateSubtotalCents(items: CartItem[]) {
  return items.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0,
  );
}

export function priceToCents(price: string) {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(price);

  if (!match) {
    return null;
  }

  const dollars = Number(match[1]);
  const cents = Number((match[2] ?? '').padEnd(2, '0'));

  if (!Number.isSafeInteger(dollars) || !Number.isSafeInteger(cents)) {
    return null;
  }

  const total = dollars * 100 + cents;
  return Number.isSafeInteger(total) ? total : null;
}

export function formatCents(cents: number) {
  return formatPrice(cents / 100);
}
