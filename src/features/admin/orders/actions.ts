'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/features/auth/authorization';
import { getPrismaClient } from '@/lib/db/prisma';
import { orderStatusSchema, type OrderActionState } from './schemas';
import { updateOrderFulfillmentStatus } from './service';

const orderIdSchema = z.string().trim().min(1);

export async function updateOrderStatusAction(
  _previousState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const administrator = await requireAdmin();
  const orderId = orderIdSchema.safeParse(formData.get('orderId'));
  const expectedStatus = orderStatusSchema.safeParse(
    formData.get('expectedStatus'),
  );
  const nextStatus = orderStatusSchema.safeParse(formData.get('status'));
  if (!orderId.success || !expectedStatus.success || !nextStatus.success) {
    return { message: 'Choose a valid order status.' };
  }

  const prisma = getPrismaClient();
  if (!prisma) return { message: 'The database is unavailable. Try again.' };

  const result = await prisma.$transaction((transaction) =>
    updateOrderFulfillmentStatus(transaction, {
      orderId: orderId.data,
      expectedStatus: expectedStatus.data,
      nextStatus: nextStatus.data,
      administratorId: administrator.id,
    }),
  );

  if (result.kind === 'missing') return { message: 'Order not found.' };
  if (result.kind === 'invalid' || result.kind === 'conflict') {
    return {
      message:
        result.kind === 'conflict'
          ? 'This order changed in another session. Refresh the page before updating its status.'
          : result.message,
    };
  }

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId.data}`);
  return { success: `Order ${result.orderNumber} status updated.` };
}
