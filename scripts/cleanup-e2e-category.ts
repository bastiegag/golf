import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { loadTestEnvironment } from './test-environment';

const categoryId = process.argv[2];
const originalSlug = process.argv[3];
const updatedSlug = process.argv[4];
const ownedSlugPattern =
  /^e2e-category-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

if (
  (!categoryId || (categoryId !== '-' && !/^[a-z0-9]{20,30}$/.test(categoryId))) ||
  !originalSlug ||
  !ownedSlugPattern.test(originalSlug) ||
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
    const category = await prisma.category.findFirst({
      where:
        categoryId === '-'
          ? { slug: { in: [originalSlug, updatedSlug] } }
          : { id: categoryId },
      select: { id: true, slug: true, _count: { select: { products: true } } },
    });
    if (
      category &&
      category._count.products === 0 &&
      (category.slug === originalSlug || category.slug === updatedSlug)
    ) {
      await prisma.category.delete({ where: { id: category.id } });
    }
  } finally {
    await prisma.$disconnect();
  }
}

void main();
