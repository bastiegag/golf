import { describe, expect, it } from 'vitest';
import {
  calculateOrderTotals,
  decimalPriceToCents,
} from '@/features/checkout/order-utils';

describe('order calculations', () => {
  it('converts Decimal-like values and calculates integer-cent totals', () => {
    const totals = calculateOrderTotals([
      { productId: 'product-1', unitPriceCents: decimalPriceToCents({ toString: () => '68.99' }), quantity: 2 },
      { productId: 'product-2', unitPriceCents: 1, quantity: 3 },
    ]);

    expect(totals.lineTotals).toEqual([
      {
        productId: 'product-1',
        unitPriceCents: 6899,
        quantity: 2,
        lineTotalCents: 13798,
      },
      {
        productId: 'product-2',
        unitPriceCents: 1,
        quantity: 3,
        lineTotalCents: 3,
      },
    ]);
    expect(totals.subtotalCents).toBe(13801);
    expect(totals.totalCents).toBe(13801);
  });

  it('rejects invalid authoritative prices', () => {
    expect(() =>
      decimalPriceToCents({ toString: () => 'not-a-price' }),
    ).toThrow('Invalid product price.');
  });
});
