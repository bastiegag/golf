import { formatCents } from '@/features/cart/utils';
import { ORDER_STATUS_LABELS } from './transitions';
import type { OrderStatus } from '@/generated/prisma/client';

export function formatOrderStatus(status: OrderStatus) {
  return ORDER_STATUS_LABELS[status];
}

export { formatCents };

export function formatOrderDate(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(date);
}
