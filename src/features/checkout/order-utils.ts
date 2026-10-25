import { randomUUID } from 'node:crypto';
import { priceToCents } from '@/features/cart/utils';

export const MAX_POSTGRES_INTEGER = 2_147_483_647;

export function decimalPriceToCents(price: { toString(): string }) {
  const cents = priceToCents(price.toString());

  if (cents === null) {
    throw new Error('Invalid product price.');
  }
  if (cents > MAX_POSTGRES_INTEGER) {
    throw new Error('Product price is out of range.');
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
  if (
    lineTotals.some(
      (line) =>
        !Number.isSafeInteger(line.lineTotalCents) ||
        line.lineTotalCents < 0 ||
        line.lineTotalCents > MAX_POSTGRES_INTEGER,
    )
  ) {
    throw new Error('Order line total is out of range.');
  }
  const subtotalCents = lineTotals.reduce(
    (total, line) => total + line.lineTotalCents,
    0,
  );

  if (
    !Number.isSafeInteger(subtotalCents) ||
    subtotalCents < 0 ||
    subtotalCents > MAX_POSTGRES_INTEGER
  ) {
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
