import 'server-only';

import { getPrismaClient } from '@/lib/db/prisma';
import type { OrderFilter } from './schemas';

export const ADMIN_ORDER_PAGE_SIZE = 20;

function dayStart(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function nextDay(value: string) {
  const date = dayStart(value);
  date.setUTCDate(date.getUTCDate() + 1);
  return date;
}

function orderWhere(filters: OrderFilter) {
  return {
    ...(filters.query
      ? {
          OR: [
            { orderNumber: { contains: filters.query, mode: 'insensitive' as const } },
            { customerName: { contains: filters.query, mode: 'insensitive' as const } },
            { customerEmail: { contains: filters.query, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.from || filters.to
      ? {
          createdAt: {
            ...(filters.from ? { gte: dayStart(filters.from) } : {}),
            ...(filters.to ? { lt: nextDay(filters.to) } : {}),
          },
        }
      : {}),
  };
}

export async function getAdminOrders(filters: OrderFilter) {
  const prisma = getPrismaClient();
  if (!prisma) return { orders: [], total: 0, page: 1, pageCount: 1 };

  const where = orderWhere(filters);
  const total = await prisma.order.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_ORDER_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const orders = await prisma.order.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    skip: (page - 1) * ADMIN_ORDER_PAGE_SIZE,
    take: ADMIN_ORDER_PAGE_SIZE,
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerEmail: true,
      totalCents: true,
      status: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
  });

  return { orders, total, page, pageCount };
}

export async function getAdminOrderById(id: string) {
  const prisma = getPrismaClient();
  if (!prisma) return null;

  return prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      customerEmail: true,
      customerName: true,
      shippingAddress: true,
      shippingCity: true,
      shippingRegion: true,
      shippingPostalCode: true,
      shippingCountry: true,
      subtotalCents: true,
      totalCents: true,
      status: true,
      createdAt: true,
      items: {
        orderBy: { id: 'asc' },
        select: {
          id: true,
          productNameSnapshot: true,
          productSlugSnapshot: true,
          unitPriceCents: true,
          quantity: true,
          lineTotalCents: true,
        },
      },
      statusHistory: {
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          previousStatus: true,
          newStatus: true,
          createdAt: true,
          administrator: { select: { name: true, email: true } },
        },
      },
    },
  });
}
