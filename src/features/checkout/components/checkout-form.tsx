'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useCart } from '@/features/cart/context';
import { formatCents } from '@/features/cart/utils';
import { quoteCheckout, submitCheckout } from '@/features/checkout/actions';
import type {
  CheckoutActionState,
  CheckoutQuoteState,
} from '@/features/checkout/types';

const initialState: CheckoutActionState = { status: 'idle' };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full"
      disabled={disabled || pending}
    >
      {pending ? 'Placing order…' : 'Place order'}
    </Button>
  );
}

function CustomerField({
  id,
  label,
  type = 'text',
  error,
  ...props
}: {
  id: string;
  label: string;
  type?: 'email' | 'text';
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        {...props}
        id={id}
        name={id}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <FieldError id={`${id}-error`}>
        {error}
      </FieldError>
    </Field>
  );
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, isHydrated, clearCart } = useCart();
  const [state, formAction] = useActionState(submitCheckout, initialState);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [quote, setQuote] = useState<CheckoutQuoteState>({
    status: 'idle',
  });
  const [priceConfirmed, setPriceConfirmed] = useState(false);

  useEffect(() => {
    setIdempotencyKey(globalThis.crypto.randomUUID());
  }, []);

  const cartPayload = useMemo(
    () =>
      JSON.stringify(
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      ),
    [items],
  );

  useEffect(() => {
    if (!isHydrated || items.length === 0) {
      return;
    }

    let cancelled = false;
    setQuote({ status: 'loading' });
    setPriceConfirmed(false);

    quoteCheckout(JSON.parse(cartPayload)).then((result) => {
      if (!cancelled) {
        setQuote(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [cartPayload, isHydrated, items.length]);

  useEffect(() => {
    if (state.status !== 'price-changed' || !isHydrated || items.length === 0) {
      return;
    }

    setPriceConfirmed(false);
    setQuote({ status: 'loading' });
    quoteCheckout(JSON.parse(cartPayload)).then(setQuote);
  }, [cartPayload, isHydrated, items.length, state.status]);

  useEffect(() => {
    if (state.status === 'success') {
      clearCart();
      router.push(
        `/orders/${state.orderNumber}/confirmation?token=${encodeURIComponent(state.confirmationToken)}`,
      );
    }
  }, [clearCart, router, state]);

  if (!isHydrated) {
    return (
      <p className="mt-8 text-muted-foreground" aria-busy="true">
        Loading your cart…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-sm border border-dashed border-border px-6 py-12 text-center">
        <h2 className="text-xl font-medium">Your cart is empty</h2>
        <p className="mt-3 text-muted-foreground">
          Add a product before continuing to checkout.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex text-sm font-medium underline underline-offset-4 focus-visible:outline-offset-4"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;
  const authoritativePrices =
    quote.status === 'success'
      ? new Map(quote.items.map((item) => [item.productId, item.priceCents]))
      : null;
  const displayItems = items.map((item) => ({
    ...item,
    priceCents: authoritativePrices?.get(item.productId) ?? item.priceCents,
  }));
  const pricesChanged =
    quote.status === 'success' &&
    items.some(
      (item) =>
        authoritativePrices?.get(item.productId) !== item.priceCents,
    );
  const canSubmit =
    idempotencyKey &&
    quote.status === 'success' &&
    (!pricesChanged || priceConfirmed);

  return (
    <form action={formAction} className="mt-10 space-y-10">
      <input type="hidden" name="cart" value={cartPayload} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <input
        type="hidden"
        name="acceptedTotalCents"
        value={quote.status === 'success' ? quote.totalCents : ''}
      />

      {state.status === 'error' ? (
        <div
          className="rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-body-sm text-destructive"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}
      {state.status === 'price-changed' ? (
        <p
          className="rounded-sm border border-warning/30 bg-warning/10 px-4 py-3 text-body-sm text-warning-foreground"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}
      {quote.status === 'error' ? (
        <p className="rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-body-sm text-destructive" role="alert">
          {quote.message}
        </p>
      ) : null}

      <fieldset className="space-y-5">
        <legend className="text-xl font-medium">Customer information</legend>
        <CustomerField
          id="customerName"
          label="Full name"
          autoComplete="name"
          error={fieldErrors?.customerName}
        />
        <CustomerField
          id="customerEmail"
          label="Email address"
          type="email"
          autoComplete="email"
          error={fieldErrors?.customerEmail}
        />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-xl font-medium">Shipping address</legend>
        <CustomerField
          id="shippingAddress"
          label="Street address"
          autoComplete="street-address"
          error={fieldErrors?.shippingAddress}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <CustomerField
            id="shippingCity"
            label="City"
            autoComplete="address-level2"
            error={fieldErrors?.shippingCity}
          />
          <CustomerField
            id="shippingRegion"
            label="Province, state, or region"
            autoComplete="address-level1"
            error={fieldErrors?.shippingRegion}
          />
          <CustomerField
            id="shippingPostalCode"
            label="Postal or ZIP code"
            autoComplete="postal-code"
            error={fieldErrors?.shippingPostalCode}
          />
          <CustomerField
            id="shippingCountry"
            label="Country"
            autoComplete="country-name"
            error={fieldErrors?.shippingCountry}
          />
        </div>
      </fieldset>

      <section aria-labelledby="checkout-summary-heading">
        <h2 id="checkout-summary-heading" className="text-xl font-medium">
          Order summary
        </h2>
        <ul className="mt-5 divide-y divide-border border-y border-border">
          {displayItems.map((item) => (
            <li
              key={item.productId}
              className="flex justify-between gap-4 py-4 text-sm"
            >
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium">
                {formatCents(item.priceCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between gap-4 font-medium">
          <span>Total</span>
          <span>
            {formatCents(
              displayItems.reduce(
                (total, item) => total + item.priceCents * item.quantity,
                0,
              ),
            )}
          </span>
        </p>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Taxes and shipping are not calculated. The displayed total is
          checked against current catalogue prices on the server.
        </p>
      </section>

      {pricesChanged && !priceConfirmed ? (
        <div className="space-y-3">
          <p
            className="text-body-sm text-warning-subtle-foreground"
            role="alert"
          >
            Product prices changed. Review the updated total and confirm it
            before placing your order.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setPriceConfirmed(true)}
          >
            Confirm updated total
          </Button>
        </div>
      ) : null}
      <SubmitButton disabled={!canSubmit || items.length === 0} />
    </form>
  );
}
