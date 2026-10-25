import { describe, expect, it } from 'vitest';
import { createRequestFingerprint } from './fingerprint';

const checkout = {
  customerName: 'Alex Morgan',
  customerEmail: 'alex@example.com',
  shippingAddress: '10 Main Street',
  shippingCity: 'Toronto',
  shippingRegion: 'Ontario',
  shippingPostalCode: 'M5V 2T6',
  shippingCountry: 'Canada',
};

describe('createRequestFingerprint', () => {
  it('normalizes checkout whitespace and cart order', () => {
    const fingerprint = createRequestFingerprint({
      checkout,
      cart: [
        { productId: 'product-2', quantity: 1 },
        { productId: 'product-1', quantity: 2 },
      ],
      acceptedTotalCents: 20499,
    });

    expect(
      createRequestFingerprint({
        checkout: Object.fromEntries(
          Object.entries(checkout).map(([key, value]) => [key, ` ${value} `]),
        ),
        cart: [
          { productId: 'product-1', quantity: 2 },
          { productId: 'product-2', quantity: 1 },
        ],
        acceptedTotalCents: 20499,
      }),
    ).toBe(fingerprint);
  });

  it('changes when business data or the accepted total changes', () => {
    const input = {
      checkout,
      cart: [{ productId: 'product-1', quantity: 1 }],
      acceptedTotalCents: 6899,
    };
    const fingerprint = createRequestFingerprint(input);

    expect(
      createRequestFingerprint({
        ...input,
        acceptedTotalCents: 6999,
      }),
    ).not.toBe(fingerprint);
    expect(
      createRequestFingerprint({
        ...input,
        cart: [{ productId: 'product-1', quantity: 2 }],
      }),
    ).not.toBe(fingerprint);
    expect(
      createRequestFingerprint({
        ...input,
        checkout: { ...checkout, customerEmail: 'other@example.com' },
      }),
    ).not.toBe(fingerprint);
  });
});
