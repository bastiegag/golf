import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createOrder, PriceChangedError } from './order-service';

const testKeyPrefix = `integration-${Date.now()}-`;
const checkout = {
  customerName: 'Integration Test',
  customerEmail: 'integration@example.com',
  shippingAddress: '10 Main Street',
  shippingCity: 'Toronto',
  shippingRegion: 'Ontario',
  shippingPostalCode: 'M5V 2T6',
  shippingCountry: 'Canada',
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    'Set E2E_DATABASE_URL when running PostgreSQL integration tests.',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

let productId: string;

describe('order service PostgreSQL integration', () => {
  beforeAll(async () => {
    const product = await prisma.product.findUnique({
      where: { slug: 'harbor-knit' },
      select: { id: true, price: true },
    });
    if (!product) {
      throw new Error('The seeded harbor-knit product is required.');
    }
    productId = product.id;
  });

  afterAll(async () => {
    await prisma.order.deleteMany({
      where: { idempotencyKey: { startsWith: testKeyPrefix } },
    });
    await prisma.$disconnect();
  });

  it('creates an order with authoritative totals and snapshots', async () => {
    const result = await createOrder({
      idempotencyKey: `${testKeyPrefix}success`,
      checkout,
      cart: [{ productId, quantity: 2 }],
      acceptedTotalCents: 13600,
    });

    const order = await prisma.order.findUnique({
      where: { orderNumber: result.orderNumber },
      include: { items: true },
    });

    expect(order).toMatchObject({
      totalCents: 13600,
      subtotalCents: 13600,
      requestFingerprint: expect.any(String),
      items: [
        expect.objectContaining({
          productId,
          productNameSnapshot: 'Harbor Knit',
          unitPriceCents: 6800,
          quantity: 2,
          lineTotalCents: 13600,
        }),
      ],
    });
  });

  it('rejects stale totals and returns one order for concurrent retries', async () => {
    await expect(
      createOrder({
        idempotencyKey: `${testKeyPrefix}stale`,
        checkout,
        cart: [{ productId, quantity: 1 }],
        acceptedTotalCents: 1,
      }),
    ).rejects.toBeInstanceOf(PriceChangedError);

    const input = {
      idempotencyKey: `${testKeyPrefix}concurrent`,
      checkout,
      cart: [{ productId, quantity: 1 }],
      acceptedTotalCents: 6800,
    };
    const results = await Promise.all([
      createOrder(input),
      createOrder(input),
    ]);

    expect(results[0]).toEqual(results[1]);
    expect(
      await prisma.order.count({
        where: { idempotencyKey: input.idempotencyKey },
      }),
    ).toBe(1);
  });
});
