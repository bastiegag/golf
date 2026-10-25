import 'server-only';

import { getPrismaClient } from '@/lib/db/prisma';

export async function getOrderForConfirmation(
  orderNumber: string,
  confirmationToken: string,
) {
  const prisma = getPrismaClient();

  if (!prisma) {
    return null;
  }

  return prisma.order.findFirst({
    where: {
      orderNumber,
      confirmationToken,
    },
    select: {
      orderNumber: true,
      customerName: true,
      status: true,
      totalCents: true,
      createdAt: true,
      items: {
        orderBy: { id: 'asc' },
        select: {
          productNameSnapshot: true,
          productSlugSnapshot: true,
          unitPriceCents: true,
          quantity: true,
          lineTotalCents: true,
        },
      },
    },
  });
}
