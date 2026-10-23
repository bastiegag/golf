import { z } from 'zod';

export const productSeedSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  price: z.string().regex(/^\d+\.\d{2}$/),
  imageUrl: z.string().startsWith('/'),
  categorySlug: z.string().min(1),
});
