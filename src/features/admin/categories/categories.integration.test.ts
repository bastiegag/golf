import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { getActiveCategories, getActiveProducts } from '@/features/products/queries/get-products';
import {
  createOrder,
  getCheckoutQuote,
  OrderValidationError,
} from '@/features/checkout/order-service';
import { categoryInputSchema } from './schemas';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('E2E_DATABASE_URL is required for category integration tests.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

describe('category administration PostgreSQL integration', () => {
  const categoryIds: string[] = [];
  const productIds: string[] = [];
  const orderIds: string[] = [];

  beforeAll(async () => {
    await prisma.category.findUniqueOrThrow({ where: { slug: 'clothing' } });
  });

  afterAll(async () => {
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
    await prisma.category.deleteMany({ where: { id: { in: categoryIds } } });
    await prisma.$disconnect();
  });

  it('creates categories, preserves relationships, and enforces unique slugs', async () => {
    const slug = `integration-category-${randomUUID()}`;
    const input = categoryInputSchema.parse({
      name: 'Integration Category',
      slug,
      isActive: true,
    });
    const category = await prisma.category.create({ data: input });
    categoryIds.push(category.id);

    const product = await prisma.product.create({
      data: {
        name: 'Category Relationship Product',
        slug: `integration-category-product-${randomUUID()}`,
        description: 'Relationship fixture.',
        price: '11.00',
        imageUrl: '/products/placeholder.svg',
        categoryId: category.id,
      },
    });
    productIds.push(product.id);

    const updated = await prisma.category.update({
      where: { id: category.id },
      data: { name: 'Renamed Integration Category', slug: `${slug}-renamed` },
    });
    expect(updated.id).toBe(category.id);
    expect(
      await prisma.product.findUnique({
        where: { id: product.id },
        select: { categoryId: true },
      }),
    ).toEqual({ categoryId: category.id });

    expect(
      await prisma.category.findUnique({
        where: { id: category.id },
        select: { _count: { select: { products: true } } },
      }),
    ).toEqual({ _count: { products: 1 } });

    await expect(
      prisma.category.create({
        data: { name: 'Duplicate', slug: updated.slug, isActive: true },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('hides category products from public queries and checkout until reactivated', async () => {
    const category = await prisma.category.create({
      data: {
        name: 'Visibility Category',
        slug: `integration-visibility-${randomUUID()}`,
        isActive: true,
      },
    });
    categoryIds.push(category.id);
    const product = await prisma.product.create({
      data: {
        name: 'Visibility Product',
        slug: `integration-visibility-product-${randomUUID()}`,
        description: 'Visibility fixture.',
        price: '13.50',
        imageUrl: '/products/placeholder.svg',
        categoryId: category.id,
        isActive: true,
      },
    });
    productIds.push(product.id);

    expect((await getActiveProducts()).some((item) => item.id === product.id)).toBe(true);
    await prisma.category.update({
      where: { id: category.id },
      data: { isActive: false },
    });
    expect((await getActiveCategories()).some((item) => item.id === category.id)).toBe(false);
    expect((await getActiveProducts()).some((item) => item.id === product.id)).toBe(false);

    await expect(
      getCheckoutQuote([{ productId: product.id, quantity: 1 }]),
    ).rejects.toBeInstanceOf(OrderValidationError);
    await expect(
      createOrder({
        idempotencyKey: randomUUID(),
        checkout: {
          customerName: 'Category Test',
          customerEmail: 'category@example.com',
          shippingAddress: '1 Test Street',
          shippingCity: 'Toronto',
          shippingRegion: 'Ontario',
          shippingPostalCode: 'M5V 2T6',
          shippingCountry: 'Canada',
        },
        cart: [{ productId: product.id, quantity: 1 }],
        acceptedTotalCents: 1350,
      }),
    ).rejects.toBeInstanceOf(OrderValidationError);

    await prisma.category.update({
      where: { id: category.id },
      data: { isActive: true },
    });
    expect((await getActiveProducts()).some((item) => item.id === product.id)).toBe(true);
    await prisma.product.update({
      where: { id: product.id },
      data: { isActive: false },
    });
    expect((await getActiveProducts()).some((item) => item.id === product.id)).toBe(false);
  });

  it('preserves order snapshots when a category changes', async () => {
    const category = await prisma.category.create({
      data: {
        name: 'Snapshot Category',
        slug: `integration-snapshot-category-${randomUUID()}`,
        isActive: true,
      },
    });
    categoryIds.push(category.id);
    const product = await prisma.product.create({
      data: {
        name: 'Category Snapshot Product',
        slug: `integration-snapshot-category-product-${randomUUID()}`,
        description: 'Snapshot fixture.',
        price: '19.25',
        imageUrl: '/products/placeholder.svg',
        categoryId: category.id,
      },
    });
    productIds.push(product.id);
    const order = await createOrder({
      idempotencyKey: randomUUID(),
      checkout: {
        customerName: 'Snapshot Category Test',
        customerEmail: 'category-snapshot@example.com',
        shippingAddress: '2 Test Street',
        shippingCity: 'Toronto',
        shippingRegion: 'Ontario',
        shippingPostalCode: 'M5V 2T6',
        shippingCountry: 'Canada',
      },
      cart: [{ productId: product.id, quantity: 1 }],
      acceptedTotalCents: 1925,
    });
    const persistedOrder = await prisma.order.findUniqueOrThrow({
      where: { orderNumber: order.orderNumber },
      include: { items: true },
    });
    orderIds.push(persistedOrder.id);
    const originalItem = persistedOrder.items[0];
    const originalTotals = {
      subtotalCents: persistedOrder.subtotalCents,
      totalCents: persistedOrder.totalCents,
    };

    await prisma.category.update({
      where: { id: category.id },
      data: {
        name: 'Changed Snapshot Category',
        slug: `changed-snapshot-category-${randomUUID()}`,
        isActive: false,
      },
    });
    const freshOrder = await prisma.order.findUniqueOrThrow({
      where: { id: persistedOrder.id },
      include: { items: true },
    });
    expect(freshOrder).toMatchObject(originalTotals);
    expect(freshOrder.items).toHaveLength(1);
    expect(freshOrder.items[0]).toMatchObject({
      id: originalItem.id,
      orderId: originalItem.orderId,
      productId: originalItem.productId,
      productNameSnapshot: originalItem.productNameSnapshot,
      productSlugSnapshot: originalItem.productSlugSnapshot,
      unitPriceCents: originalItem.unitPriceCents,
      quantity: originalItem.quantity,
      lineTotalCents: originalItem.lineTotalCents,
    });
  });
});
