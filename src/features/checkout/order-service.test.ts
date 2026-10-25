import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPrismaClient } from '@/lib/db/prisma';
import { createOrder } from '@/features/checkout/order-service';

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
    });

    expect(result.totalCents).toBe(13798);
    expect(findProducts).toHaveBeenCalledWith({
      where: { id: { in: ['product-1'] }, isActive: true },
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
    };
    findExisting.mockResolvedValue(existing);

    await expect(
      createOrder({
        idempotencyKey: '6a6f9d5a-5582-40e4-8c5a-2c113932e7e4',
        checkout,
        cart: [{ productId: 'product-1', quantity: 1 }],
      }),
    ).resolves.toEqual(existing);
    expect(findProducts).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });
});
