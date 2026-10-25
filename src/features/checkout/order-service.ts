import 'server-only';

import { getPrismaClient } from '@/lib/db/prisma';
import {
  checkoutFieldsSchema,
  checkoutCartSchema,
  idempotencyKeySchema,
} from './schemas';
import {
  calculateOrderTotals,
  createConfirmationToken,
  createOrderNumber,
  decimalPriceToCents,
} from './order-utils';

export type CreateOrderInput = {
  idempotencyKey: string;
  checkout: unknown;
  cart: unknown;
};

export type CreatedOrder = {
  orderNumber: string;
  confirmationToken: string;
  totalCents: number;
};

export type CheckoutQuote = {
  items: Array<{ productId: string; priceCents: number }>;
  totalCents: number;
};

export class OrderValidationError extends Error {
  constructor(
    message: string,
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'OrderValidationError';
  }
}

async function getPricedCart(cart: unknown) {
  const cartResult = checkoutCartSchema.safeParse(cart);
  if (!cartResult.success) {
    throw new OrderValidationError(
      cartResult.error.issues[0]?.message ?? 'Review your cart.',
    );
  }

  const prisma = getPrismaClient();
  if (!prisma) {
    throw new Error('Database is unavailable.');
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: cartResult.data.map((item) => item.productId) },
      isActive: true,
    },
  });

  if (products.length !== cartResult.data.length) {
    throw new OrderValidationError(
      'One or more products are no longer available. Review your cart and try again.',
    );
  }

  const productById = new Map(products.map((product) => [product.id, product]));
  const lines = cartResult.data.map((item) => {
    const product = productById.get(item.productId);

    if (!product) {
      throw new OrderValidationError(
        'One or more products are no longer available. Review your cart and try again.',
      );
    }

    return {
      productId: product.id,
      unitPriceCents: decimalPriceToCents(product.price),
      quantity: item.quantity,
    };
  });

  return { cart: cartResult.data, products, totals: calculateOrderTotals(lines) };
}

export async function getCheckoutQuote(cart: unknown): Promise<CheckoutQuote> {
  const { totals } = await getPricedCart(cart);

  return {
    items: totals.lineTotals.map((line) => ({
      productId: line.productId,
      priceCents: line.unitPriceCents,
    })),
    totalCents: totals.totalCents,
  };
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreatedOrder> {
  if (!idempotencyKeySchema.safeParse(input.idempotencyKey).success) {
    throw new OrderValidationError(
      'Your checkout session expired. Refresh and try again.',
    );
  }

  const checkoutResult = checkoutFieldsSchema.safeParse(input.checkout);
  if (!checkoutResult.success) {
    throw new OrderValidationError(
      'Review the highlighted checkout fields.',
      Object.fromEntries(
        checkoutResult.error.issues.map((issue) => [
          String(issue.path[0]),
          issue.message,
        ]),
      ),
    );
  }

  const prisma = getPrismaClient();
  if (!prisma) {
    throw new Error('Database is unavailable.');
  }

  try {
    return await prisma.$transaction(async (transaction) => {
      const existingOrder = await transaction.order.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        select: {
          orderNumber: true,
          confirmationToken: true,
          totalCents: true,
        },
      });

      if (existingOrder) {
        return existingOrder;
      }

      const cartResult = checkoutCartSchema.safeParse(input.cart);
      if (!cartResult.success) {
        throw new OrderValidationError(
          cartResult.error.issues[0]?.message ?? 'Review your cart.',
        );
      }

      const products = await transaction.product.findMany({
        where: {
          id: { in: cartResult.data.map((item) => item.productId) },
          isActive: true,
        },
      });

      if (products.length !== cartResult.data.length) {
        throw new OrderValidationError(
          'One or more products are no longer available. Review your cart and try again.',
        );
      }

      const productById = new Map(products.map((product) => [product.id, product]));
      const pricedLines = cartResult.data.map((item) => {
        const product = productById.get(item.productId);

        if (!product) {
          throw new OrderValidationError(
            'One or more products are no longer available. Review your cart and try again.',
          );
        }

        return {
          productId: product.id,
          productNameSnapshot: product.name,
          productSlugSnapshot: product.slug,
          unitPriceCents: decimalPriceToCents(product.price),
          quantity: item.quantity,
        };
      });
      const totals = calculateOrderTotals(pricedLines);
      const orderNumber = createOrderNumber();
      const confirmationToken = createConfirmationToken();

      await transaction.order.create({
        data: {
          orderNumber,
          confirmationToken,
          idempotencyKey: input.idempotencyKey,
          ...checkoutResult.data,
          subtotalCents: totals.subtotalCents,
          totalCents: totals.totalCents,
          items: {
            create: totals.lineTotals.map((line) => ({
              productId: line.productId,
              productNameSnapshot: line.productNameSnapshot,
              productSlugSnapshot: line.productSlugSnapshot,
              unitPriceCents: line.unitPriceCents,
              quantity: line.quantity,
              lineTotalCents: line.lineTotalCents,
            })),
          },
        },
      });

      return { orderNumber, confirmationToken, totalCents: totals.totalCents };
    });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      throw error;
    }

    try {
      const existingOrder = await prisma.order.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        select: {
          orderNumber: true,
          confirmationToken: true,
          totalCents: true,
        },
      });

      if (existingOrder) {
        return existingOrder;
      }
    } catch {
      throw new Error('Unable to create the order.');
    }

    throw new Error('Unable to create the order.');
  }
}
