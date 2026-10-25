import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createOrder,
  PriceChangedError,
} from './order-service';
import { getOrderForConfirmation } from './queries/get-order';
import { decimalPriceToCents } from './order-utils';
import { randomUUID } from 'node:crypto';

const testKeys = new Set<string>();
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
let productPriceCents: number;

function createTestKey() {
  const key = randomUUID();
  testKeys.add(key);
  return key;
}

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
    productPriceCents = decimalPriceToCents(product.price);
  });

  afterAll(async () => {
    await prisma.order.deleteMany({ where: { idempotencyKey: { in: [...testKeys] } } });
    await prisma.$disconnect();
  });

  it('creates an order with authoritative totals and snapshots', async () => {
    const result = await createOrder({
      idempotencyKey: createTestKey(),
      checkout,
      cart: [{ productId, quantity: 2 }],
      acceptedTotalCents: productPriceCents * 2,
    });

    const order = await prisma.order.findUnique({
      where: { orderNumber: result.orderNumber },
      include: { items: true },
    });

    expect(order).toMatchObject({
      totalCents: productPriceCents * 2,
      subtotalCents: productPriceCents * 2,
      requestFingerprint: expect.any(String),
      items: [
        expect.objectContaining({
          productId,
          productNameSnapshot: 'Harbor Knit',
          unitPriceCents: productPriceCents,
          quantity: 2,
          lineTotalCents: productPriceCents * 2,
        }),
      ],
    });
  });

  it('rejects stale totals and returns one order for concurrent retries', async () => {
    const staleKey = createTestKey();
    await expect(
      createOrder({
        idempotencyKey: staleKey,
        checkout,
        cart: [{ productId, quantity: 1 }],
        acceptedTotalCents: 1,
      }),
    ).rejects.toBeInstanceOf(PriceChangedError);
    expect(
      await prisma.order.count({ where: { idempotencyKey: staleKey } }),
    ).toBe(0);

    const input = {
      idempotencyKey: createTestKey(),
      checkout,
      cart: [{ productId, quantity: 1 }],
      acceptedTotalCents: productPriceCents,
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

  it('rejects conflicting idempotency requests without changing the original order', async () => {
    const idempotencyKey = createTestKey();
    const original = await createOrder({
      idempotencyKey,
      checkout,
      cart: [{ productId, quantity: 1 }],
      acceptedTotalCents: productPriceCents,
    });

    await expect(
      createOrder({
        idempotencyKey,
        checkout: { ...checkout, customerName: 'Different Customer' },
        cart: [{ productId, quantity: 1 }],
        acceptedTotalCents: productPriceCents,
      }),
    ).rejects.toThrow('already used for different order details');

    expect(
      await prisma.order.count({ where: { idempotencyKey } }),
    ).toBe(1);
    expect(
      await getOrderForConfirmation(original.orderNumber, 'wrong-token'),
    ).toBeNull();
    expect(
      await getOrderForConfirmation(
        original.orderNumber,
        original.confirmationToken,
      ),
    ).toMatchObject({ orderNumber: original.orderNumber });
  });
});
