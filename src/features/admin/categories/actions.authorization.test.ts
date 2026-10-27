import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAdmin, getPrismaClient, redirect } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getPrismaClient: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@/features/auth/authorization', () => ({ requireAdmin }));
vi.mock('@/lib/db/prisma', () => ({ getPrismaClient }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect }));

import {
  createCategoryAction,
  toggleCategoryStatusAction,
  updateCategoryAction,
} from './actions';

function categoryForm() {
  const formData = new FormData();
  formData.set('name', 'Test Category');
  formData.set('slug', 'test-category');
  formData.set('isActive', 'on');
  return formData;
}

describe('category action authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdmin.mockRejectedValue(new Error('Unauthorized'));
  });

  it('rejects direct unauthenticated mutations before database access', async () => {
    await expect(createCategoryAction({}, categoryForm())).rejects.toThrow('Unauthorized');
    await expect(updateCategoryAction('category-1', {}, categoryForm())).rejects.toThrow('Unauthorized');
    const status = new FormData();
    status.set('id', 'category-1');
    status.set('isActive', 'false');
    await expect(toggleCategoryStatusAction(status)).rejects.toThrow('Unauthorized');
    expect(getPrismaClient).not.toHaveBeenCalled();
  });

  it('allows an authorized administrator to create, edit, and toggle status', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
    redirect.mockImplementation(() => {
      throw new Error('redirect');
    });
    const prisma = {
      category: {
        create: vi.fn().mockResolvedValue({ id: 'category-1' }),
        update: vi.fn().mockResolvedValue({ id: 'category-1' }),
      },
      product: { findMany: vi.fn().mockResolvedValue([]) },
    };
    getPrismaClient.mockReturnValue(prisma);

    await expect(createCategoryAction({}, categoryForm())).rejects.toThrow('redirect');
    await expect(updateCategoryAction('category-1', {}, categoryForm())).rejects.toThrow('redirect');
    const status = new FormData();
    status.set('id', 'category-1');
    status.set('isActive', 'false');
    await expect(toggleCategoryStatusAction(status)).resolves.toBeUndefined();
    expect(prisma.category.create).toHaveBeenCalled();
    expect(prisma.category.update).toHaveBeenCalled();
  });
});
