import type { OrderStatus, Prisma } from '@/generated/prisma/client';
import { getOrderTransitionError } from './transitions';

export type OrderStatusUpdateResult =
  | { kind: 'missing' }
  | { kind: 'conflict' }
  | { kind: 'invalid'; message: string }
  | { kind: 'updated'; orderNumber: string };

export async function updateOrderFulfillmentStatus(
  transaction: Prisma.TransactionClient,
  input: {
    orderId: string;
    expectedStatus: OrderStatus;
    nextStatus: OrderStatus;
    administratorId: string;
  },
): Promise<OrderStatusUpdateResult> {
  const current = await transaction.order.findUnique({
    where: { id: input.orderId },
    select: { status: true, orderNumber: true },
  });
  if (!current) return { kind: 'missing' };

  if (current.status !== input.expectedStatus) {
    return { kind: 'conflict' };
  }

  const transitionError = getOrderTransitionError(
    current.status,
    input.nextStatus,
  );
  if (transitionError) {
    return { kind: 'invalid', message: transitionError };
  }

  const updated = await transaction.order.updateMany({
    where: { id: input.orderId, status: input.expectedStatus },
    data: { status: input.nextStatus },
  });
  if (updated.count !== 1) return { kind: 'conflict' };

  await transaction.orderStatusHistory.create({
    data: {
      orderId: input.orderId,
      previousStatus: current.status,
      newStatus: input.nextStatus,
      administratorId: input.administratorId,
    },
  });

  return { kind: 'updated', orderNumber: current.orderNumber };
}
