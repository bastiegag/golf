import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAdmin, getPrismaClient, revalidatePath } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getPrismaClient: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('@/features/auth/authorization', () => ({ requireAdmin }));
vi.mock('@/lib/db/prisma', () => ({ getPrismaClient }));
vi.mock('next/cache', () => ({ revalidatePath }));

import { updateOrderStatusAction } from './actions';

function statusForm() {
  const formData = new FormData();
  formData.set('orderId', 'order-1');
  formData.set('status', 'PROCESSING');
  return formData;
}

describe('order status action authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdmin.mockRejectedValue(new Error('Unauthorized'));
  });

  it('rejects unauthenticated direct invocations before database access', async () => {
    await expect(updateOrderStatusAction({}, statusForm())).rejects.toThrow('Unauthorized');
    expect(getPrismaClient).not.toHaveBeenCalled();
  });

  it('updates status and history atomically for an authorized administrator', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
    const transaction = {
      order: {
        findUnique: vi.fn().mockResolvedValue({
          orderNumber: 'GOLF-123',
          status: 'PENDING',
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      orderStatusHistory: { create: vi.fn().mockResolvedValue({ id: 'history-1' }) },
    };
    const prisma = {
      $transaction: vi.fn((callback: (tx: typeof transaction) => unknown) => callback(transaction)),
    };
    getPrismaClient.mockReturnValue(prisma);

    await expect(updateOrderStatusAction({}, statusForm())).resolves.toEqual({
      success: 'Order GOLF-123 status updated.',
    });
    expect(transaction.order.updateMany).toHaveBeenCalledWith({
      where: { id: 'order-1', status: 'PENDING' },
      data: { status: 'PROCESSING' },
    });
    expect(transaction.orderStatusHistory.create).toHaveBeenCalledWith({
      data: {
        orderId: 'order-1',
        previousStatus: 'PENDING',
        newStatus: 'PROCESSING',
        administratorId: 'admin-1',
      },
    });
    expect(revalidatePath).toHaveBeenCalled();
  });

  it('returns a conflict without creating history when the conditional update loses a race', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
    const transaction = {
      order: {
        findUnique: vi.fn().mockResolvedValue({ orderNumber: 'GOLF-123', status: 'PENDING' }),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      orderStatusHistory: { create: vi.fn() },
    };
    getPrismaClient.mockReturnValue({
      $transaction: vi.fn((callback: (tx: typeof transaction) => unknown) => callback(transaction)),
    });

    await expect(updateOrderStatusAction({}, statusForm())).resolves.toEqual({
      message: 'This order changed in another session. Refresh and try again.',
    });
    expect(transaction.orderStatusHistory.create).not.toHaveBeenCalled();
  });
});
