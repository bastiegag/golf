import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, OrderStatus } from '@/generated/prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { createOrder } from '@/features/checkout/order-service';
import { getAdminOrderById, getAdminOrders } from './queries';
import { parseOrderFilters } from './schemas';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('E2E_DATABASE_URL is required for order integration tests.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

describe('order administration PostgreSQL integration', () => {
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
    await prisma.orderStatusHistory.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
    await prisma.$disconnect();
  });

  async function createTestOrder(overrides?: {
    customerName?: string;
    customerEmail?: string;
  }) {
    const product = await prisma.product.create({
      data: {
        name: `Order Test Product ${randomUUID()}`,
        slug: `integration-order-product-${randomUUID()}`,
        description: 'Order administration integration fixture.',
        price: '18.50',
        imageUrl: '/products/placeholder.svg',
        categoryId,
      },
    });
    productIds.push(product.id);
    const created = await createOrder({
      idempotencyKey: randomUUID(),
      checkout: {
        customerName: overrides?.customerName ?? 'Order Test Customer',
        customerEmail: overrides?.customerEmail ?? 'order-test@example.com',
        shippingAddress: '1 Test Street',
        shippingCity: 'Toronto',
        shippingRegion: 'Ontario',
        shippingPostalCode: 'M5V 2T6',
        shippingCountry: 'Canada',
      },
      cart: [{ productId: product.id, quantity: 2 }],
      acceptedTotalCents: 3700,
    });
    const order = await prisma.order.findUniqueOrThrow({
      where: { orderNumber: created.orderNumber },
      include: { items: true },
    });
    orderIds.push(order.id);
    return order;
  }

  it('creates pending orders with immutable snapshots and totals', async () => {
    const order = await createTestOrder();
    expect(order.status).toBe(OrderStatus.PENDING);
    expect(order.subtotalCents).toBe(3700);
    expect(order.totalCents).toBe(3700);
    expect(order.items[0]).toMatchObject({
      productNameSnapshot: expect.any(String),
      productSlugSnapshot: expect.stringContaining('integration-order-product-'),
      unitPriceCents: 1850,
      quantity: 2,
      lineTotalCents: 3700,
    });

    await prisma.product.update({
      where: { id: order.items[0].productId },
      data: { name: 'Renamed Product', price: '99.99' },
    });
    const fresh = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { items: true },
    });
    expect(fresh.totalCents).toBe(3700);
    expect(fresh.items[0].productNameSnapshot).not.toBe('Renamed Product');
    expect(fresh.items[0].unitPriceCents).toBe(1850);
  });

  it('persists valid status history and rejects stale conditional updates', async () => {
    const order = await createTestOrder();
    const first = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.order.updateMany({
        where: { id: order.id, status: OrderStatus.PENDING },
        data: { status: OrderStatus.PROCESSING },
      });
      if (updated.count !== 1) return false;
      await transaction.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: OrderStatus.PENDING,
          newStatus: OrderStatus.PROCESSING,
        },
      });
      return true;
    });
    expect(first).toBe(true);

    const stale = await prisma.order.updateMany({
      where: { id: order.id, status: OrderStatus.PENDING },
      data: { status: OrderStatus.CANCELLED },
    });
    expect(stale.count).toBe(0);

    const detail = await getAdminOrderById(order.id);
    expect(detail?.status).toBe(OrderStatus.PROCESSING);
    expect(detail?.statusHistory).toHaveLength(1);
    expect(detail?.statusHistory[0]).toMatchObject({
      previousStatus: OrderStatus.PENDING,
      newStatus: OrderStatus.PROCESSING,
    });
  });

  it('searches by customer data, filters by status, and paginates safely', async () => {
    const order = await createTestOrder({
      customerName: `Searchable ${randomUUID()}`,
      customerEmail: 'unique-order-search@example.com',
    });
    const filters = parseOrderFilters({
      query: 'unique-order-search@example.com',
      page: '99',
    });
    const result = await getAdminOrders(filters);
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.page).toBe(1);
    expect(result.orders.some((item) => item.id === order.id)).toBe(true);

    const pending = await getAdminOrders(
      parseOrderFilters({ status: 'PENDING', page: '1' }),
    );
    expect(pending.orders.every((item) => item.status === OrderStatus.PENDING)).toBe(true);
  });
});
