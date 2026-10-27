import type { Prisma } from '@/generated/prisma/client';

type ActiveProductAdditional = Omit<
  Prisma.ProductWhereInput,
  'category' | 'isActive'
> & {
  category?: Prisma.CategoryWhereInput;
};

export function activeProductWhere(
  additional: ActiveProductAdditional = {},
): Prisma.ProductWhereInput {
  const { category, ...rest } = additional;

  return {
    ...rest,
    isActive: true,
    category: { ...category, isActive: true },
  };
}
