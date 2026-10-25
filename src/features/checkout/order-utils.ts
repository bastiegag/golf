import { randomUUID } from 'node:crypto';
import { priceToCents } from '@/features/cart/utils';

export function decimalPriceToCents(price: { toString(): string }) {
  const cents = priceToCents(price.toString());

  if (cents === null) {
    throw new Error('Invalid product price.');
  }

  return cents;
}

export function calculateOrderTotals<
  T extends { unitPriceCents: number; quantity: number },
>(lines: T[]) {
  const lineTotals = lines.map((line) => ({
    ...line,
    lineTotalCents: line.unitPriceCents * line.quantity,
  }));
  const subtotalCents = lineTotals.reduce(
    (total, line) => total + line.lineTotalCents,
    0,
  );

  if (!Number.isSafeInteger(subtotalCents)) {
    throw new Error('Order total is out of range.');
  }

  return { lineTotals, subtotalCents, totalCents: subtotalCents };
}

export function createOrderNumber() {
  return `GOLF-${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
}

export function createConfirmationToken() {
  return randomUUID();
}
