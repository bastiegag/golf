import 'server-only';

import { getPrismaClient } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma/client';
import {
  checkoutFieldsSchema,
  checkoutCartSchema,
  acceptedTotalCentsSchema,
  idempotencyKeySchema,
} from './schemas';
import { createRequestFingerprint } from './fingerprint';
import {
  calculateOrderTotals,
  createConfirmationToken,
  createOrderNumber,
  decimalPriceToCents,
} from './order-utils';
import { activeProductWhere } from '@/features/products/queries/availability';

export type CreateOrderInput = {
  idempotencyKey: string;
  checkout: unknown;
  cart: unknown;
  acceptedTotalCents: unknown;
};

export type CreatedOrder = {
  orderNumber: string;
  confirmationToken: string;
  totalCents: number;
  requestFingerprint: string;
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

export class PriceChangedError extends OrderValidationError {
  constructor(readonly currentTotalCents: number) {
    super(
      'The total changed while you were checking out. Review and confirm the updated total.',
    );
    this.name = 'PriceChangedError';
  }
}

export class IdempotencyConflictError extends OrderValidationError {
  constructor() {
    super(
      'This checkout session was already used for different order details. Refresh and try again.',
    );
    this.name = 'IdempotencyConflictError';
  }
}

function isIdempotencyUniqueConflict(error: unknown) {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== 'P2002'
  ) {
    return false;
  }

  const target = error.meta?.target;
  return (
    target === 'idempotencyKey' ||
    (Array.isArray(target) && target.includes('idempotencyKey'))
  );
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
    where: activeProductWhere({
      id: { in: cartResult.data.map((item) => item.productId) },
    }),
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
  const acceptedTotalResult = acceptedTotalCentsSchema.safeParse(
    input.acceptedTotalCents,
  );
  if (!acceptedTotalResult.success) {
    throw new OrderValidationError(
      'Review the total before placing your order.',
    );
  }

  const prisma = getPrismaClient();
  if (!prisma) {
    throw new Error('Database is unavailable.');
  }

  const cartResult = checkoutCartSchema.safeParse(input.cart);
  if (!cartResult.success) {
    throw new OrderValidationError(
      cartResult.error.issues[0]?.message ?? 'Review your cart.',
    );
  }
  const requestFingerprint = createRequestFingerprint({
    checkout: checkoutResult.data,
    cart: cartResult.data,
    acceptedTotalCents: acceptedTotalResult.data,
  });

  try {
    return await prisma.$transaction(async (transaction) => {
      const existingOrder = await transaction.order.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        select: {
          orderNumber: true,
          confirmationToken: true,
          totalCents: true,
          requestFingerprint: true,
        },
      });

      if (existingOrder) {
        if (existingOrder.requestFingerprint !== requestFingerprint) {
          throw new IdempotencyConflictError();
        }
        return {
          orderNumber: existingOrder.orderNumber,
          confirmationToken: existingOrder.confirmationToken,
          totalCents: existingOrder.totalCents,
          requestFingerprint: existingOrder.requestFingerprint,
        };
      }

      const products = await transaction.product.findMany({
        where: activeProductWhere({
          id: { in: cartResult.data.map((item) => item.productId) },
        }),
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
      if (totals.totalCents !== acceptedTotalResult.data) {
        throw new PriceChangedError(totals.totalCents);
      }
      const orderNumber = createOrderNumber();
      const confirmationToken = createConfirmationToken();

      await transaction.order.create({
        data: {
          orderNumber,
          confirmationToken,
          idempotencyKey: input.idempotencyKey,
          requestFingerprint,
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

      return {
        orderNumber,
        confirmationToken,
        totalCents: totals.totalCents,
        requestFingerprint,
      };
    });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      throw error;
    }

    if (!isIdempotencyUniqueConflict(error)) {
      throw new Error('Unable to create the order.');
    }

    const existingOrder = await prisma.order.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      select: {
        orderNumber: true,
        confirmationToken: true,
        totalCents: true,
        requestFingerprint: true,
      },
    });

    if (existingOrder) {
      if (existingOrder.requestFingerprint !== requestFingerprint) {
        throw new IdempotencyConflictError();
      }
      return {
        orderNumber: existingOrder.orderNumber,
        confirmationToken: existingOrder.confirmationToken,
        totalCents: existingOrder.totalCents,
        requestFingerprint: existingOrder.requestFingerprint,
      };
    }

    throw new Error('Unable to create the order.');
  }
}
