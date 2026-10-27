import { OrderStatus } from '@/generated/prisma/client';
import { z } from 'zod';

export const orderStatusSchema = z.nativeEnum(OrderStatus);

const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a date in YYYY-MM-DD format.')
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }, 'Enter a valid calendar date.');

export const orderFilterSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  query: z.string().trim().max(120).catch(''),
  status: orderStatusSchema.optional().catch(undefined),
  from: dateSchema.optional().catch(undefined),
  to: dateSchema.optional().catch(undefined),
});

export type OrderFilter = z.infer<typeof orderFilterSchema>;

export function parseOrderFilters(
  params: Record<string, string | string[] | undefined>,
): OrderFilter {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const parsed = orderFilterSchema.parse({
    page: first(params.page),
    query: first(params.query),
    status: first(params.status),
    from: first(params.from),
    to: first(params.to),
  });

  return {
    ...parsed,
    ...(parsed.from && parsed.to && parsed.from > parsed.to
      ? { from: parsed.to, to: parsed.from }
      : {}),
  };
}

export type OrderActionState = {
  message?: string;
  success?: string;
};
