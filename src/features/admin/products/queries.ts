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
    return { products: [], total: 0, page: 1, pageCount: 1 };
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

  const total = await prisma.product.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_PRODUCT_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const products = await prisma.product.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * ADMIN_PRODUCT_PAGE_SIZE,
      take: ADMIN_PRODUCT_PAGE_SIZE,
      include: { category: true },
    });

  return {
    products: products.map((product) => ({
      ...product,
      price: product.price.toString(),
    })),
    total,
    page,
    pageCount,
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
