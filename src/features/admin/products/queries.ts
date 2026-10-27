import 'server-only';

import { getPrismaClient } from '@/lib/db/prisma';
import type { ProductFilter } from './schemas';

export const ADMIN_PRODUCT_PAGE_SIZE = 10;

export async function getAdminCategories() {
  const prisma = getPrismaClient();
  if (!prisma) return [];

  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  });
}

export async function getAdminProducts(filters: ProductFilter) {
  const prisma = getPrismaClient();
  if (!prisma) {
    return { products: [], total: 0 };
  }

  const where = {
    ...(filters.query
      ? {
          OR: [
            { name: { contains: filters.query, mode: 'insensitive' as const } },
            { slug: { contains: filters.query, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(filters.status === 'active' ? { isActive: true } : {}),
    ...(filters.status === 'inactive' ? { isActive: false } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
  };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (filters.page - 1) * ADMIN_PRODUCT_PAGE_SIZE,
      take: ADMIN_PRODUCT_PAGE_SIZE,
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((product) => ({
      ...product,
      price: product.price.toString(),
    })),
    total,
  };
}

export async function getAdminProductById(id: string) {
  const prisma = getPrismaClient();
  if (!prisma) return null;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  return product
    ? { ...product, price: product.price.toString() }
    : null;
}
