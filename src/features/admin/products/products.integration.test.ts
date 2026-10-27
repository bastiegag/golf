import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { getActiveProductBySlug } from '@/features/products/queries/get-product';
import { getActiveProducts } from '@/features/products/queries/get-products';
import { productInputSchema } from './schemas';
import { createOrder } from '@/features/checkout/order-service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('E2E_DATABASE_URL is required for product integration tests.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

describe('product administration PostgreSQL integration', () => {
  let categoryId: string;
  let accessoriesCategoryId: string;
  const productIds: string[] = [];
  const orderIds: string[] = [];

  beforeAll(async () => {
    const category = await prisma.category.findUnique({
      where: { slug: 'clothing' },
      select: { id: true },
    });
    if (!category) throw new Error('The seeded clothing category is required.');
    categoryId = category.id;
    const accessories = await prisma.category.findUnique({
      where: { slug: 'accessories' },
      select: { id: true },
    });
    if (!accessories) throw new Error('The seeded accessories category is required.');
    accessoriesCategoryId = accessories.id;
  });

  afterAll(async () => {
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
    await prisma.$disconnect();
  });

  it('creates, edits, and toggles a test-owned product', async () => {
    const slug = `integration-product-${randomUUID()}`;
    const input = productInputSchema.parse({
      name: 'Integration Product',
      slug,
      description: 'Created by the product administration integration suite.',
      price: '12.50',
      imageUrl: '/products/placeholder.svg',
      categoryId,
      isActive: false,
    });
    const product = await prisma.product.create({
      data: { ...input, price: input.price },
    });
    productIds.push(product.id);

    expect(product.price.toFixed(2)).toBe('12.50');
    expect(await getActiveProductBySlug(slug)).toBeNull();

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        name: 'Updated Integration Product',
        slug: `${slug}-updated`,
        description: 'Updated description.',
        price: '24.75',
        isActive: true,
        categoryId: accessoriesCategoryId,
      },
    });

    expect(updated.id).toBe(product.id);
    expect(updated.price.toFixed(2)).toBe('24.75');
    expect(await getActiveProductBySlug(updated.slug)).toMatchObject({
      id: product.id,
      name: 'Updated Integration Product',
      category: { id: accessoriesCategoryId },
    });
    expect(
      (await getActiveProducts()).some((item) => item.id === product.id),
    ).toBe(true);

    await prisma.product.update({
      where: { id: product.id },
      data: { isActive: false },
    });
    expect(await getActiveProductBySlug(updated.slug)).toBeNull();
    expect(await prisma.product.findUnique({ where: { id: 'missing-product' } })).toBeNull();
  });

  it('rejects invalid categories and duplicate slugs', async () => {
    const slug = `integration-constraints-${randomUUID()}`;
    const product = await prisma.product.create({
      data: {
        name: 'Constraint Product',
        slug,
        description: 'Created by the constraint test.',
        price: '9.00',
        imageUrl: '/products/placeholder.svg',
        categoryId,
      },
    });
    productIds.push(product.id);

    await expect(
      prisma.product.create({
        data: {
          name: 'Duplicate Slug',
          slug,
          description: 'Should fail.',
          price: '9.00',
          imageUrl: '/products/placeholder.svg',
          categoryId,
        },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });

    await expect(
      prisma.product.create({
        data: {
          name: 'Invalid Category',
          slug: `${slug}-invalid-category`,
          description: 'Should fail.',
          price: '9.00',
          imageUrl: '/products/placeholder.svg',
          categoryId: 'missing-category',
        },
      }),
    ).rejects.toMatchObject({ code: 'P2003' });
  });

  it('preserves order snapshots when product details change', async () => {
    const slug = `integration-snapshot-${randomUUID()}`;
    const product = await prisma.product.create({
      data: {
        name: 'Original Snapshot Product',
        slug,
        description: 'Snapshot source.',
        price: '17.25',
        imageUrl: '/products/placeholder.svg',
        categoryId,
      },
    });
    productIds.push(product.id);

    const order = await createOrder({
      idempotencyKey: randomUUID(),
      checkout: {
        customerName: 'Product Snapshot Test',
        customerEmail: 'snapshot@example.com',
        shippingAddress: '1 Test Street',
        shippingCity: 'Toronto',
        shippingRegion: 'Ontario',
        shippingPostalCode: 'M5V 2T6',
        shippingCountry: 'Canada',
      },
      cart: [{ productId: product.id, quantity: 1 }],
      acceptedTotalCents: 1725,
    });
    orderIds.push(
      (await prisma.order.findUnique({ where: { orderNumber: order.orderNumber } }))!.id,
    );

    await prisma.product.update({
      where: { id: product.id },
      data: { name: 'Changed Product', price: '99.99' },
    });

    const item = await prisma.orderItem.findFirst({
      where: { orderId: orderIds[orderIds.length - 1] },
    });
    expect(item).toMatchObject({
      productNameSnapshot: 'Original Snapshot Product',
      unitPriceCents: 1725,
      lineTotalCents: 1725,
    });
  });
});
