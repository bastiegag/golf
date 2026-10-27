import { z } from 'zod';

const localImagePathSchema = z
  .string()
  .trim()
  .min(1, 'Image URL is required.')
  .refine((value) => value.startsWith('/') && !value.startsWith('//'), {
    message: 'Use a local image path beginning with /.',
  });

export const productInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required.')
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Use lowercase letters, numbers, and single hyphens.',
    ),
  description: z.string().trim().min(1, 'Description is required.').max(2000),
  price: z
    .string()
    .trim()
    .regex(/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/, 'Enter a valid price.')
    .refine((value) => Number(value) >= 0, 'Price cannot be negative.')
    .refine((value) => Number(value) <= 9_999_999.99, 'Price is too high.'),
  imageUrl: localImagePathSchema,
  categoryId: z.string().trim().min(1, 'Category is required.'),
  isActive: z.boolean(),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export function slugifyProductName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export const productFilterSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  query: z.string().trim().max(120).catch(''),
  status: z.enum(['all', 'active', 'inactive']).catch('all'),
  categoryId: z.string().trim().catch(''),
});

export type ProductFilter = z.infer<typeof productFilterSchema>;

export function parseProductFilters(
  params: Record<string, string | string[] | undefined>,
): ProductFilter {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  return productFilterSchema.parse({
    page: first(params.page),
    query: first(params.query),
    status: first(params.status),
    categoryId: first(params.categoryId),
  });
}
