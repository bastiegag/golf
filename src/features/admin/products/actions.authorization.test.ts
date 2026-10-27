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

  it('allows an active administrator to create, edit, and change status', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
    redirect.mockImplementation(() => {
      throw new Error('redirect');
    });
    const product = {
      id: 'product-1',
      slug: 'old-product',
      categoryId: 'category-1',
    };
    const prisma = {
      category: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'category-1',
          isActive: true,
        }),
      },
      product: {
        create: vi.fn().mockResolvedValue(product),
        findUnique: vi.fn().mockResolvedValue(product),
        update: vi.fn().mockResolvedValue(product),
      },
    };
    getPrismaClient.mockReturnValue(prisma);

    await expect(createProductAction({}, formData)).rejects.toThrow('redirect');
    await expect(
      updateProductAction('product-1', {}, formData),
    ).rejects.toThrow('redirect');
    const statusForm = new FormData();
    statusForm.set('id', 'product-1');
    statusForm.set('isActive', 'false');
    await expect(
      toggleProductStatusAction(statusForm),
    ).resolves.toBeUndefined();

    expect(prisma.product.create).toHaveBeenCalled();
    expect(prisma.product.update).toHaveBeenCalled();
  });

  it('rejects malformed identifiers and status values before database access', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
    getPrismaClient.mockReturnValue({});

    await expect(
      updateProductAction('', {}, formData),
    ).resolves.toMatchObject({ message: 'Product not found.' });

    const invalidStatus = new FormData();
    invalidStatus.set('id', 'product-1');
    invalidStatus.set('isActive', 'maybe');
    await expect(toggleProductStatusAction(invalidStatus)).resolves.toBeUndefined();
    expect(getPrismaClient).not.toHaveBeenCalled();
  });

  it('rejects creating or moving a product into an inactive category', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
    const category = {
      findUnique: vi.fn().mockResolvedValue({ id: 'category-1', isActive: false }),
    };
    const product = {
      findUnique: vi.fn().mockResolvedValue({
        id: 'product-1',
        slug: 'product-1',
        categoryId: 'active-category',
      }),
      create: vi.fn(),
      update: vi.fn(),
    };
    getPrismaClient.mockReturnValue({ category, product });

    const createResult = await createProductAction({}, formData);
    expect(createResult).toMatchObject({
      fieldErrors: { categoryId: 'Select an existing category.' },
    });
    const updateResult = await updateProductAction('product-1', {}, formData);
    expect(updateResult).toMatchObject({
      fieldErrors: { categoryId: 'Select an existing category.' },
    });
    expect(product.create).not.toHaveBeenCalled();
    expect(product.update).not.toHaveBeenCalled();
  });

  it('allows editing an existing inactive assignment and moving to an active category', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
    redirect.mockImplementation(() => {
      throw new Error('redirect');
    });
    const category = {
      findUnique: vi.fn().mockResolvedValue({ id: 'category-1', isActive: false }),
    };
    const product = {
      findUnique: vi.fn().mockResolvedValue({
        id: 'product-1',
        slug: 'product-1',
        categoryId: 'category-1',
      }),
      update: vi.fn().mockResolvedValue({ id: 'product-1' }),
    };
    getPrismaClient.mockReturnValue({ category, product });

    await expect(
      updateProductAction('product-1', {}, formData),
    ).rejects.toThrow('redirect');
    expect(product.update).toHaveBeenCalled();

    category.findUnique.mockResolvedValue({ id: 'category-1', isActive: true });
    product.findUnique.mockResolvedValue({
      id: 'product-1',
      slug: 'product-1',
      categoryId: 'inactive-category',
    });
    await expect(
      updateProductAction('product-1', {}, formData),
    ).rejects.toThrow('redirect');
    expect(product.update).toHaveBeenCalledTimes(2);
  });

  it('rejects deleted categories without writing a product', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
    const product = {
      findUnique: vi.fn().mockResolvedValue({
        id: 'product-1',
        slug: 'product-1',
        categoryId: 'category-1',
      }),
      update: vi.fn(),
    };
    getPrismaClient.mockReturnValue({
      category: { findUnique: vi.fn().mockResolvedValue(null) },
      product,
    });

    const result = await updateProductAction('product-1', {}, formData);
    expect(result).toMatchObject({
      fieldErrors: { categoryId: 'Select an existing category.' },
    });
    expect(product.update).not.toHaveBeenCalled();
  });
});
