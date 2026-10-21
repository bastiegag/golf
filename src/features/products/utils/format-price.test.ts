import { describe, expect, it } from 'vitest';
import { formatPrice } from '@/features/products/utils/format-price';

describe('formatPrice', () => {
  it('formats a decimal price as US currency', () => {
    expect(formatPrice('68.00')).toBe('$68.00');
  });

  it('accepts numeric prices', () => {
    expect(formatPrice(18)).toBe('$18.00');
  });
});
