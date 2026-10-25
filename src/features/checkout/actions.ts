'use server';

import { idempotencyKeySchema } from './schemas';
import {
  createOrder,
  getCheckoutQuote,
  OrderValidationError,
} from './order-service';
import type { CheckoutActionState } from './types';

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function submitCheckout(
  _previousState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const idempotencyKey = idempotencyKeySchema.safeParse(
    getFormString(formData, 'idempotencyKey'),
  );

  if (!idempotencyKey.success) {
    return {
      status: 'error',
      message: 'Your checkout session expired. Refresh and try again.',
    };
  }

  let cart: unknown;
  try {
    cart = JSON.parse(getFormString(formData, 'cart'));
  } catch {
    return {
      status: 'error',
      message: 'Your cart could not be read. Review it and try again.',
    };
  }

  try {
    const order = await createOrder({
      idempotencyKey: idempotencyKey.data,
      cart,
      checkout: {
        customerName: getFormString(formData, 'customerName'),
        customerEmail: getFormString(formData, 'customerEmail'),
        shippingAddress: getFormString(formData, 'shippingAddress'),
        shippingCity: getFormString(formData, 'shippingCity'),
        shippingRegion: getFormString(formData, 'shippingRegion'),
        shippingPostalCode: getFormString(formData, 'shippingPostalCode'),
        shippingCountry: getFormString(formData, 'shippingCountry'),
      },
    });

    return { status: 'success', ...order };
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return {
        status: 'error',
        message: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    return {
      status: 'error',
      message: 'We could not place your order. Please try again.',
    };
  }
}

export async function quoteCheckout(
  cart: unknown,
): Promise<
  | {
      status: 'success';
      items: Array<{ productId: string; priceCents: number }>;
      totalCents: number;
    }
  | { status: 'error'; message: string }
> {
  try {
    return { status: 'success', ...(await getCheckoutQuote(cart)) };
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return { status: 'error', message: error.message };
    }

    return {
      status: 'error',
      message: 'We could not verify the current catalogue prices.',
    };
  }
}
