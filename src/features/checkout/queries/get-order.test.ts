import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPrismaClient } from '@/lib/db/prisma';
import { getOrderForConfirmation } from '@/features/checkout/queries/get-order';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/db/prisma', () => ({
  getPrismaClient: vi.fn(),
}));

const mockedGetPrismaClient = vi.mocked(getPrismaClient);
const findFirst = vi.fn();

describe('getOrderForConfirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetPrismaClient.mockReturnValue({
      order: { findFirst },
    } as never);
  });

  it('requires both the order number and confirmation token', async () => {
    findFirst.mockResolvedValue(null);

    await expect(
      getOrderForConfirmation('GOLF-123', 'secret-token'),
    ).resolves.toBeNull();
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        orderNumber: 'GOLF-123',
        confirmationToken: 'secret-token',
      },
      select: expect.objectContaining({
        customerName: true,
        items: expect.anything(),
      }),
    });
  });
});
