import { z } from 'zod';

export const categoryInputSchema = z.object({
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
  isActive: z.boolean(),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export function slugifyCategoryName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}
