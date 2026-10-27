import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { loadTestEnvironment } from './test-environment';

const productId = process.argv[2];
const originalSlug = process.argv[3];
const updatedSlug = process.argv[4];

if (
  !productId ||
  !/^[a-z0-9]{20,30}$/.test(productId) ||
  !originalSlug ||
  !/^e2e-product-[a-f0-9-]+$/.test(originalSlug) ||
  !updatedSlug ||
  updatedSlug !== `${originalSlug}-updated`
) {
  throw new Error('Cleanup requires a valid E2E product id and owned slugs.');
}

const environment = loadTestEnvironment();
async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: environment.DATABASE_URL }),
  });

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { slug: true },
    });
    if (
      product &&
      (product.slug === originalSlug || product.slug === updatedSlug)
    ) {
      await prisma.product.delete({ where: { id: productId } });
    }
  } finally {
    await prisma.$disconnect();
  }
}

void main();
