import type { OrderStatus } from '@/generated/prisma/client';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const allowedTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export function getAllowedOrderTransitions(status: OrderStatus) {
  return allowedTransitions[status];
}

export function isAllowedOrderTransition(
  current: OrderStatus,
  next: OrderStatus,
) {
  return allowedTransitions[current].includes(next);
}

export function getOrderTransitionError(
  current: OrderStatus,
  next: OrderStatus,
) {
  if (isAllowedOrderTransition(current, next)) return null;
  return `Orders cannot move from ${ORDER_STATUS_LABELS[current]} to ${ORDER_STATUS_LABELS[next]}.`;
}
