import 'server-only';
import { getPrismaClient } from '@/lib/db/prisma';
import { serializeProduct } from './get-products';

export async function getActiveProductBySlug(slug: string) {
  const prisma = getPrismaClient();

  if (!prisma) {
    return null;
  }

  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
    },
  });

  return product ? serializeProduct(product) : null;
}
