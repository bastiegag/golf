import 'server-only';
import { getPrismaClient } from '@/lib/db/prisma';

export async function getActiveProducts() {
  const prisma = getPrismaClient();

  if (!prisma) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  return products.map((product) => ({
    ...product,
    price: product.price.toString(),
  }));
}
