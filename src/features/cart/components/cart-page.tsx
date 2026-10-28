'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { useCart } from '@/features/cart/context';
import { MAX_CART_QUANTITY } from '@/features/cart/constants';
import { CartSummary } from '@/features/cart/components/cart-summary';
import { formatCents } from '@/features/cart/utils';

export function CartPage() {
  const {
    items,
    isHydrated,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  if (!isHydrated) {
    return (
      <Container className="py-16 sm:py-20" aria-busy="true">
        <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
          Your cart
        </h1>
        <p className="mt-5 text-muted-foreground">Loading your cart…</p>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-16 sm:py-20">
        <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
          Your cart
        </h1>
        <div className="mt-12 rounded-sm border border-dashed border-border px-6 py-16 text-center">
          <h2 className="text-xl font-medium">Your cart is empty</h2>
          <p className="mt-3 text-muted-foreground">
            Add something considered to get started.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex text-sm font-medium underline underline-offset-4 focus-visible:outline-offset-4"
          >
            Continue shopping
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-16 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-4 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            Your selection
          </p>
          <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
            Your cart
          </h1>
        </div>
        <Button type="button" variant="outline" onClick={clearCart}>
          Clear cart
        </Button>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <section aria-label="Cart items">
          <ul className="m-0 list-none divide-y divide-border p-0">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-5 py-6 first:pt-0">
                <Link
                  href={`/products/${item.slug}`}
                  className="relative h-28 w-28 shrink-0 overflow-hidden bg-muted focus-visible:outline-offset-4 sm:h-36 sm:w-36"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="144px"
                    className="object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-medium hover:text-accent focus-visible:outline-offset-4"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatCents(item.priceCents)} each
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-medium">
                      {formatCents(item.priceCents * item.quantity)}
                    </p>
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <div
                      className="flex items-center gap-2"
                      aria-label={`Quantity of ${item.name}`}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        disabled={item.quantity === 1}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="h-8 w-8 p-0 text-lg leading-none disabled:opacity-40"
                      >
                        −
                      </Button>
                      <span
                        className="min-w-5 text-center text-sm"
                        aria-label={`${item.quantity} items`}
                      >
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        disabled={item.quantity === MAX_CART_QUANTITY}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="h-8 w-8 p-0 text-lg leading-none disabled:opacity-40"
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeItem(item.productId)}
                      className="p-0 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <CartSummary />
      </div>
    </Container>
  );
}
