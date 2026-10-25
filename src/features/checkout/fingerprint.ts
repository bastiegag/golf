import { createHash } from 'node:crypto';

export function createRequestFingerprint(input: {
  checkout: Record<string, string>;
  cart: Array<{ productId: string; quantity: number }>;
  acceptedTotalCents: number;
}) {
  const normalized = {
    checkout: Object.fromEntries(
      Object.entries(input.checkout).map(([key, value]) => [
        key,
        value.trim(),
      ]),
    ),
    cart: [...input.cart]
      .sort((left, right) => left.productId.localeCompare(right.productId))
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    acceptedTotalCents: input.acceptedTotalCents,
  };

  return createHash('sha256')
    .update(JSON.stringify(normalized))
    .digest('hex');
}
