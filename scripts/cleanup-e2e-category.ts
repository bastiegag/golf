import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { loadTestEnvironment } from './test-environment';

const categoryId = process.argv[2];
const originalSlug = process.argv[3];
const updatedSlug = process.argv[4];

if (
  !categoryId ||
  !/^[a-z0-9]{20,30}$/.test(categoryId) ||
  !originalSlug ||
  !/^e2e-category-[a-f0-9-]+$/.test(originalSlug) ||
  !updatedSlug ||
  updatedSlug !== `${originalSlug}-updated`
) {
  throw new Error('Cleanup requires a valid E2E category id and owned slugs.');
}

const environment = loadTestEnvironment();

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: environment.DATABASE_URL }),
  });

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { slug: true, _count: { select: { products: true } } },
    });
    if (
      category &&
      category._count.products === 0 &&
      (category.slug === originalSlug || category.slug === updatedSlug)
    ) {
      await prisma.category.delete({ where: { id: categoryId } });
    }
  } finally {
    await prisma.$disconnect();
  }
}

void main();
