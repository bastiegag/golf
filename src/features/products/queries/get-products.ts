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

export async function getActiveProducts() {
  const prisma = getPrismaClient();

  if (!prisma) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  return products.map(serializeProduct);
}
