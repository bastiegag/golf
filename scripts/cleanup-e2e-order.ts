import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { loadTestEnvironment } from './test-environment';

const orderId = process.argv[2];
const orderNumber = process.argv[3];
const productSlug = process.argv[4];
const markerPattern =
  /^E2E-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const productPattern =
  /^e2e-order-product-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

if (
  (!orderId || (orderId !== '-' && !/^[a-z0-9]{20,30}$/.test(orderId))) ||
  !orderNumber ||
  !markerPattern.test(orderNumber) ||
  !productSlug ||
  !productPattern.test(productSlug)
) {
  throw new Error('Cleanup requires a valid E2E order and product marker.');
}

const environment = loadTestEnvironment();
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: environment.DATABASE_URL }),
});

async function main() {
  try {
    const order = await prisma.order.findFirst({
      where:
        orderId === '-'
          ? { orderNumber }
          : { id: orderId, orderNumber },
      select: { id: true, orderNumber: true },
    });
    if (order) {
      await prisma.order.delete({ where: { id: order.id } });
    }

    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      select: { id: true },
    });
    if (product) {
      await prisma.product.delete({ where: { id: product.id } });
    }
  } finally {
    await prisma.$disconnect();
  }
}

void main();
