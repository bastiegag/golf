import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { getActiveProductBySlug } from '@/features/products/queries/get-product';
import { getActiveProducts } from '@/features/products/queries/get-products';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('E2E_DATABASE_URL is required for product integration tests.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

describe('product administration PostgreSQL integration', () => {
  let categoryId: string;
  const productIds: string[] = [];
  const orderIds: string[] = [];

  beforeAll(async () => {
    const category = await prisma.category.findUnique({
      where: { slug: 'clothing' },
      select: { id: true },
    });
    if (!category) throw new Error('The seeded clothing category is required.');
    categoryId = category.id;
  });

  afterAll(async () => {
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
    await prisma.$disconnect();
  });

  it('creates, edits, and toggles a test-owned product', async () => {
    const slug = `integration-product-${randomUUID()}`;
    const product = await prisma.product.create({
      data: {
        name: 'Integration Product',
        slug,
        description: 'Created by the product administration integration suite.',
        price: '12.50',
        imageUrl: '/products/placeholder.svg',
        categoryId,
        isActive: false,
      },
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
      },
    });

    expect(updated.id).toBe(product.id);
    expect(updated.price.toFixed(2)).toBe('24.75');
    expect(await getActiveProductBySlug(updated.slug)).toMatchObject({
      id: product.id,
      name: 'Updated Integration Product',
    });
    expect(
      (await getActiveProducts()).some((item) => item.id === product.id),
    ).toBe(true);

    await prisma.product.update({
      where: { id: product.id },
      data: { isActive: false },
    });
    expect(await getActiveProductBySlug(updated.slug)).toBeNull();
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
});
