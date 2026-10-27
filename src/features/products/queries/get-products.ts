import 'server-only';
import { getPrismaClient } from '@/lib/db/prisma';
import { activeProductWhere } from './availability';

export function serializeProduct<
  T extends {
    price: {
      toString(): string;
    };
  },
>(product: T): Omit<T, 'price'> & { price: string } {
  return {
    ...product,
    price: product.price.toString(),
  };
}

export async function getActiveProducts(categorySlug?: string) {
  const prisma = getPrismaClient();

  if (!prisma) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: activeProductWhere(
      categorySlug ? { category: { slug: categorySlug } } : {},
    ),
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { name: true, slug: true } } },
  });

  return products.map(serializeProduct);
}

export async function getActiveCategories() {
  const prisma = getPrismaClient();

  if (!prisma) {
    return [];
  }

  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}
