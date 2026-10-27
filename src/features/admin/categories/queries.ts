import 'server-only';

import { getPrismaClient } from '@/lib/db/prisma';

export async function getAdminCategories() {
  const prisma = getPrismaClient();
  if (!prisma) return [];

  return prisma.category.findMany({
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
    include: { _count: { select: { products: true } } },
  });
}

export async function getAdminCategoryById(id: string) {
  const prisma = getPrismaClient();
  if (!prisma) return null;

  return prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
}
