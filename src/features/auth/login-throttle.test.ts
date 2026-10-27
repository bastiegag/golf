import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getPrismaClient } = vi.hoisted(() => ({
  getPrismaClient: vi.fn(),
}));

vi.mock('@/lib/db/prisma', () => ({ getPrismaClient }));

import {
  consumeLoginAttempt,
  LOGIN_ATTEMPT_LIMIT,
  clearLoginAttempts,
} from './login-throttle';

describe('login throttling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fails closed when the database is unavailable', async () => {
    getPrismaClient.mockReturnValue(null);
    await expect(consumeLoginAttempt('admin@example.test')).resolves.toBe(false);
  });

  it('blocks attempts after the bounded database-backed limit', async () => {
    const queryRaw = vi.fn().mockResolvedValue([{ attempts: LOGIN_ATTEMPT_LIMIT + 1 }]);
    getPrismaClient.mockReturnValue({ $queryRaw: queryRaw });

    await expect(consumeLoginAttempt('admin@example.test')).resolves.toBe(false);
    expect(queryRaw).toHaveBeenCalledOnce();
  });

  it('clears the hashed throttle record after successful authentication', async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    getPrismaClient.mockReturnValue({ loginThrottle: { deleteMany } });

    await clearLoginAttempts('admin@example.test');
    expect(deleteMany).toHaveBeenCalledWith({
      where: { key: expect.any(String) },
    });
    expect(deleteMany.mock.calls[0]?.[0].where.key).not.toContain(
      'admin@example.test',
    );
  });
});
