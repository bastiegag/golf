import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPrismaClient } from '@/lib/db/prisma';
import {
  getActiveCategories,
  getActiveProducts,
} from '@/features/products/queries/get-products';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/db/prisma', () => ({
  getPrismaClient: vi.fn(),
}));

const mockedGetPrismaClient = vi.mocked(getPrismaClient);

describe('product catalogue queries', () => {
  const findManyProducts = vi.fn();
  const findManyCategories = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetPrismaClient.mockReturnValue({
      product: { findMany: findManyProducts },
      category: { findMany: findManyCategories },
    } as never);
  });

  it('retrieves active products without a category filter', async () => {
    findManyProducts.mockResolvedValue([]);

    await expect(getActiveProducts()).resolves.toEqual([]);
    expect(findManyProducts).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  });

  it('filters active products by category slug', async () => {
    findManyProducts.mockResolvedValue([]);

    await getActiveProducts('clothing');

    expect(findManyProducts).toHaveBeenCalledWith({
      where: {
        isActive: true,
        category: { slug: 'clothing' },
      },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  });

  it('returns an empty result for an unknown category slug', async () => {
    findManyProducts.mockResolvedValue([]);

    await expect(getActiveProducts('unknown')).resolves.toEqual([]);
    expect(findManyProducts).toHaveBeenCalledWith({
      where: {
        isActive: true,
        category: { slug: 'unknown' },
      },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  });

  it('retrieves categories ordered for the catalogue filter', async () => {
    const categories = [
      { name: 'Accessories', slug: 'accessories' },
      { name: 'Clothing', slug: 'clothing' },
    ];
    findManyCategories.mockResolvedValue(categories);

    await expect(getActiveCategories()).resolves.toEqual(categories);
    expect(findManyCategories).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    });
  });
});
