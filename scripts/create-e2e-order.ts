import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { loadTestEnvironment } from './test-environment';

const marker = process.argv[2];
const markerPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
if (!marker || !markerPattern.test(marker)) {
  throw new Error('A valid E2E UUID marker is required.');
}

const environment = loadTestEnvironment();
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: environment.DATABASE_URL }),
});

async function main() {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: 'clothing' },
      select: { id: true, isActive: true },
    });
    if (!category?.isActive) {
      throw new Error('The seeded clothing category must be active.');
    }

    const productSlug = `e2e-order-product-${marker}`;
    const orderNumber = `E2E-${marker}`;
    const customerEmail = `e2e-order-${marker}@example.com`;
    const { product, order } = await prisma.$transaction(async (transaction) => {
      const product = await transaction.product.create({
        data: {
          name: `E2E Order Product ${marker}`,
          slug: productSlug,
          description: 'E2E order administration fixture.',
          price: '18.50',
          imageUrl: '/products/placeholder.svg',
          categoryId: category.id,
        },
      });

      const order = await transaction.order.create({
        data: {
          orderNumber,
          confirmationToken: randomUUID(),
          idempotencyKey: `e2e-order-${marker}`,
          customerEmail,
          customerName: `E2E Customer ${marker}`,
          shippingAddress: '1 E2E Test Street',
          shippingCity: 'Toronto',
          shippingRegion: 'Ontario',
          shippingPostalCode: 'M5V 2T6',
          shippingCountry: 'Canada',
          subtotalCents: 3700,
          totalCents: 3700,
          items: {
            create: {
              productId: product.id,
              productNameSnapshot: product.name,
              productSlugSnapshot: product.slug,
              unitPriceCents: 1850,
              quantity: 2,
              lineTotalCents: 3700,
            },
          },
        },
      });
      return { product, order };
    });

    process.stdout.write(
      `${JSON.stringify({
        orderId: order.id,
        orderNumber: order.orderNumber,
        productId: product.id,
        productSlug,
        customerEmail,
      })}\n`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main();
