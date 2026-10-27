'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/features/auth/authorization';
import { getPrismaClient } from '@/lib/db/prisma';
import { getOrderTransitionError } from './transitions';
import { orderStatusSchema, type OrderActionState } from './schemas';

const orderIdSchema = z.string().trim().min(1);

export async function updateOrderStatusAction(
  _previousState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const administrator = await requireAdmin();
  const orderId = orderIdSchema.safeParse(formData.get('orderId'));
  const nextStatus = orderStatusSchema.safeParse(formData.get('status'));
  if (!orderId.success || !nextStatus.success) {
    return { message: 'Choose a valid order status.' };
  }

  const prisma = getPrismaClient();
  if (!prisma) return { message: 'The database is unavailable. Try again.' };

  const result = await prisma.$transaction(async (transaction) => {
      const current = await transaction.order.findUnique({
        where: { id: orderId.data },
        select: { status: true, orderNumber: true },
      });
      if (!current) return { kind: 'missing' as const };

      const transitionError = getOrderTransitionError(
        current.status,
        nextStatus.data,
      );
      if (transitionError) {
        return { kind: 'invalid' as const, message: transitionError };
      }

      const updated = await transaction.order.updateMany({
        where: { id: orderId.data, status: current.status },
        data: { status: nextStatus.data },
      });
      if (updated.count !== 1) return { kind: 'conflict' as const };

      await transaction.orderStatusHistory.create({
        data: {
          orderId: orderId.data,
          previousStatus: current.status,
          newStatus: nextStatus.data,
          administratorId: administrator.id,
        },
      });
      return { kind: 'updated' as const, orderNumber: current.orderNumber };
    });

  if (result.kind === 'missing') return { message: 'Order not found.' };
  if (result.kind === 'invalid' || result.kind === 'conflict') {
    return {
      message:
        result.kind === 'conflict'
          ? 'This order changed in another session. Refresh and try again.'
          : result.message,
    };
  }

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId.data}`);
  return { success: `Order ${result.orderNumber} status updated.` };
}
