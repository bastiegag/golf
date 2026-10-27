import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPrismaClient } from '@/lib/db/prisma';
import {
  createOrder,
  IdempotencyConflictError,
  PriceChangedError,
} from '@/features/checkout/order-service';
import { createRequestFingerprint } from '@/features/checkout/fingerprint';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/db/prisma', () => ({
  getPrismaClient: vi.fn(),
}));

const mockedGetPrismaClient = vi.mocked(getPrismaClient);

const checkout = {
  customerName: 'Alex Morgan',
  customerEmail: 'alex@example.com',
  shippingAddress: '10 Main Street',
  shippingCity: 'Toronto',
  shippingRegion: 'Ontario',
  shippingPostalCode: 'M5V 2T6',
  shippingCountry: 'Canada',
};

describe('createOrder', () => {
  const findExisting = vi.fn();
  const findProducts = vi.fn();
  const create = vi.fn();
  const transaction = {
    order: { findUnique: findExisting, create },
    product: { findMany: findProducts },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    findExisting.mockResolvedValue(null);
    mockedGetPrismaClient.mockReturnValue({
      $transaction: vi.fn(async (callback) => callback(transaction)),
      order: { findUnique: findExisting },
    } as never);
  });

  it('re-fetches active product prices and persists snapshots atomically', async () => {
    findProducts.mockResolvedValue([
      {
        id: 'product-1',
        name: 'Harbor Knit',
        slug: 'harbor-knit',
        price: { toString: () => '68.99' },
        isActive: true,
      },
    ]);

    const result = await createOrder({
      idempotencyKey: '6a6f9d5a-5582-40e4-8c5a-2c113932e7e4',
      checkout,
      cart: [{ productId: 'product-1', quantity: 2 }],
      acceptedTotalCents: 13798,
    });

    expect(result.totalCents).toBe(13798);
    expect(findProducts).toHaveBeenCalledWith({
      where: {
        id: { in: ['product-1'] },
        isActive: true,
        category: { isActive: true },
      },
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotalCents: 13798,
          totalCents: 13798,
          items: {
            create: [
              expect.objectContaining({
                productId: 'product-1',
                productNameSnapshot: 'Harbor Knit',
                unitPriceCents: 6899,
                quantity: 2,
                lineTotalCents: 13798,
              }),
            ],
          },
        }),
      }),
    );
  });

  it('returns the existing order for an idempotent retry', async () => {
    const existing = {
      orderNumber: 'GOLF-EXISTING',
      confirmationToken: 'token',
      totalCents: 6800,
      requestFingerprint: createRequestFingerprint({
        checkout,
        cart: [{ productId: 'product-1', quantity: 1 }],
        acceptedTotalCents: 6800,
      }),
    };
    findExisting.mockResolvedValue(existing);

    await expect(
      createOrder({
        idempotencyKey: '6a6f9d5a-5582-40e4-8c5a-2c113932e7e4',
        checkout,
        cart: [{ productId: 'product-1', quantity: 1 }],
        acceptedTotalCents: 6800,
      }),
    ).resolves.toEqual(existing);
    expect(findProducts).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects an accepted total that no longer matches database prices', async () => {
    findProducts.mockResolvedValue([
      {
        id: 'product-1',
        name: 'Harbor Knit',
        slug: 'harbor-knit',
        price: { toString: () => '68.99' },
        isActive: true,
      },
    ]);

    const error = await createOrder({
      idempotencyKey: 'd4e3b26e-8b57-4cf7-a2cc-7bb1f4d5cf2a',
      checkout,
      cart: [{ productId: 'product-1', quantity: 1 }],
      acceptedTotalCents: 6700,
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(PriceChangedError);
    expect(error).toMatchObject({
      currentTotalCents: 6899,
    });
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects reuse of an idempotency key for different request data', async () => {
    const existing = {
      orderNumber: 'GOLF-EXISTING',
      confirmationToken: 'token',
      totalCents: 6800,
      requestFingerprint: createRequestFingerprint({
        checkout,
        cart: [{ productId: 'product-1', quantity: 1 }],
        acceptedTotalCents: 6800,
      }),
    };
    findExisting.mockResolvedValue(existing);

    await expect(
      createOrder({
        idempotencyKey: '6a6f9d5a-5582-40e4-8c5a-2c113932e7e4',
        checkout,
        cart: [{ productId: 'product-1', quantity: 2 }],
        acceptedTotalCents: 13798,
      }),
    ).rejects.toBeInstanceOf(IdempotencyConflictError);
    expect(create).not.toHaveBeenCalled();
  });

  it('does not treat an unexpected database error as an idempotent success', async () => {
    const databaseError = new Error('connection lost');
    mockedGetPrismaClient.mockReturnValue({
      $transaction: vi.fn().mockRejectedValue(databaseError),
      order: { findUnique: findExisting },
    } as never);
    findExisting.mockResolvedValue({
      orderNumber: 'GOLF-SHOULD-NOT-BE-USED',
      confirmationToken: 'secret',
      totalCents: 6800,
      requestFingerprint: 'unrelated',
    });

    await expect(
      createOrder({
        idempotencyKey: '6a6f9d5a-5582-40e4-8c5a-2c113932e7e4',
        checkout,
        cart: [{ productId: 'product-1', quantity: 1 }],
        acceptedTotalCents: 6800,
      }),
    ).rejects.toThrow('Unable to create the order.');
    expect(findExisting).not.toHaveBeenCalled();
  });
});
