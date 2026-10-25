import { z } from 'zod';
import { MAX_CART_QUANTITY } from '@/features/cart/constants';

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

export const checkoutFieldsSchema = z.object({
  customerName: requiredText('Full name', 100),
  customerEmail: z
    .string()
    .trim()
    .email('Enter a valid email address.')
    .max(254, 'Email address is too long.'),
  shippingAddress: requiredText('Street address', 200),
  shippingCity: requiredText('City', 100),
  shippingRegion: requiredText('Province, state, or region', 100),
  shippingPostalCode: requiredText('Postal or ZIP code', 32),
  shippingCountry: requiredText('Country', 100),
});

export const checkoutCartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(MAX_CART_QUANTITY),
});

export const checkoutCartSchema = z
  .array(checkoutCartItemSchema)
  .min(1, 'Your cart is empty.')
  .superRefine((items, context) => {
    const productIds = new Set<string>();

    for (const [index, item] of items.entries()) {
      if (productIds.has(item.productId)) {
        context.addIssue({
          code: 'custom',
          path: [index, 'productId'],
          message: 'Duplicate products are not allowed.',
        });
      }
      productIds.add(item.productId);
    }
  });

export const idempotencyKeySchema = z.string().uuid();
