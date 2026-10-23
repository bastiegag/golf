import 'server-only';
import { getPrismaClient } from '@/lib/db/prisma';

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
    where: {
      isActive: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });

  return products.map(serializeProduct);
}

export async function getActiveCategories() {
  const prisma = getPrismaClient();

  if (!prisma) {
    return [];
  }

  return prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}
