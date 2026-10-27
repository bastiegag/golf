import 'server-only';
import { getPrismaClient } from '@/lib/db/prisma';
import { serializeProduct } from './get-products';
import { activeProductWhere } from './availability';

export async function getActiveProductBySlug(slug: string) {
  const prisma = getPrismaClient();

  if (!prisma) {
    return null;
  }

  const product = await prisma.product.findFirst({
    where: activeProductWhere({ slug }),
    include: { category: { select: { name: true, slug: true } } },
  });

  return product ? serializeProduct(product) : null;
}
