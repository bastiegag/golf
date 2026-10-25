import { describe, expect, it } from 'vitest';
import {
  checkoutCartSchema,
  checkoutFieldsSchema,
} from '@/features/checkout/schemas';

const validCheckout = {
  customerName: 'Alex Morgan',
  customerEmail: 'alex@example.com',
  shippingAddress: '10 Main Street',
  shippingCity: 'Toronto',
  shippingRegion: 'Ontario',
  shippingPostalCode: 'M5V 2T6',
  shippingCountry: 'Canada',
};

describe('checkout validation', () => {
  it('accepts complete customer and international address details', () => {
    expect(checkoutFieldsSchema.safeParse(validCheckout).success).toBe(true);
  });

  it('rejects missing fields and invalid email addresses', () => {
    const result = checkoutFieldsSchema.safeParse({
      ...validCheckout,
      customerName: '',
      customerEmail: 'not-an-email',
    });

    expect(result.success).toBe(false);
  });

  it('rejects empty, invalid, and duplicate cart entries', () => {
    expect(checkoutCartSchema.safeParse([]).success).toBe(false);
    expect(
      checkoutCartSchema.safeParse([
        { productId: 'product-1', quantity: 1 },
        { productId: 'product-1', quantity: 1 },
      ]).success,
    ).toBe(false);
    expect(
      checkoutCartSchema.safeParse([
        { productId: 'product-1', quantity: 0 },
      ]).success,
    ).toBe(false);
  });
});
