import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAdmin, getPrismaClient } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getPrismaClient: vi.fn(),
}));

vi.mock('@/features/auth/authorization', () => ({ requireAdmin }));
vi.mock('@/lib/db/prisma', () => ({ getPrismaClient }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

import {
  createProductAction,
  toggleProductStatusAction,
  updateProductAction,
} from './actions';

const formData = new FormData();
formData.set('name', 'Test Product');
formData.set('slug', 'test-product');
formData.set('description', 'A test product.');
formData.set('price', '10.00');
formData.set('imageUrl', '/products/placeholder.svg');
formData.set('categoryId', 'category-1');
formData.set('isActive', 'on');

describe('product action authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdmin.mockRejectedValue(new Error('Unauthorized'));
  });

  it('rejects direct unauthenticated creation before database access', async () => {
    await expect(createProductAction({}, formData)).rejects.toThrow(
      'Unauthorized',
    );
    expect(getPrismaClient).not.toHaveBeenCalled();
  });

  it('rejects direct unauthenticated edits before database access', async () => {
    await expect(
      updateProductAction('product-1', {}, formData),
    ).rejects.toThrow('Unauthorized');
    expect(getPrismaClient).not.toHaveBeenCalled();
  });

  it('rejects direct unauthenticated status changes before database access', async () => {
    const statusForm = new FormData();
    statusForm.set('id', 'product-1');
    statusForm.set('isActive', 'false');

    await expect(toggleProductStatusAction(statusForm)).rejects.toThrow(
      'Unauthorized',
    );
    expect(getPrismaClient).not.toHaveBeenCalled();
  });
});
