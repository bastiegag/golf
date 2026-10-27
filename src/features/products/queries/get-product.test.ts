import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPrismaClient } from '@/lib/db/prisma';
import { getActiveProductBySlug } from '@/features/products/queries/get-product';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/db/prisma', () => ({
  getPrismaClient: vi.fn(),
}));

const mockedGetPrismaClient = vi.mocked(getPrismaClient);

describe('getActiveProductBySlug', () => {
  const findFirst = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetPrismaClient.mockReturnValue({
      product: { findFirst },
    } as never);
  });

  it('returns an active product with a serialized price', async () => {
    findFirst.mockResolvedValue({
      id: 'product-1',
      slug: 'harbor-knit',
      name: 'Harbor Knit',
      description: 'A soft, easy layer for cool mornings.',
      price: { toString: () => '68.00' },
      imageUrl: '/products/harbor-knit.svg',
      isActive: true,
      categoryId: 'category-1',
      category: { name: 'Clothing', slug: 'clothing' },
    });

    await expect(getActiveProductBySlug('harbor-knit')).resolves.toMatchObject({
      slug: 'harbor-knit',
      price: '68.00',
    });
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        slug: 'harbor-knit',
        isActive: true,
        category: { isActive: true },
      },
      include: { category: { select: { name: true, slug: true } } },
    });
  });

  it.each([
    ['missing', null],
    ['inactive', null],
  ])('returns null for a %s product', async (_, result) => {
    findFirst.mockResolvedValue(result);

    await expect(getActiveProductBySlug('unavailable')).resolves.toBeNull();
  });
});
