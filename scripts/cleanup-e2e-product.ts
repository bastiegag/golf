import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { loadTestEnvironment } from './test-environment';

const productId = process.argv[2];
const originalSlug = process.argv[3];
const updatedSlug = process.argv[4];
const ownedSlugPattern =
  /^e2e-product-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

if (
  (!productId || (productId !== '-' && !/^[a-z0-9]{20,30}$/.test(productId))) ||
  !originalSlug ||
  !ownedSlugPattern.test(originalSlug) ||
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
    const product = await prisma.product.findFirst({
      where:
        productId === '-'
          ? { slug: { in: [originalSlug, updatedSlug] } }
          : { id: productId },
      select: { id: true, slug: true },
    });
    if (
      product &&
      (product.slug === originalSlug || product.slug === updatedSlug)
    ) {
      await prisma.product.delete({ where: { id: product.id } });
    }
  } finally {
    await prisma.$disconnect();
  }
}

void main();
