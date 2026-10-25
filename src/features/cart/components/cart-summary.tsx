'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/features/cart/context';
import { formatCents } from '@/features/cart/utils';

export function CartSummary() {
  const { itemCount, subtotalCents } = useCart();

  return (
    <aside className="rounded-sm bg-muted p-6" aria-label="Cart summary">
      <h2 className="text-lg font-medium">Summary</h2>
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt>Items</dt>
          <dd>{itemCount}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-border pt-3 text-base font-medium">
          <dt>Subtotal</dt>
          <dd>{formatCents(subtotalCents)}</dd>
        </div>
      </dl>
      <p className="mt-5 text-xs leading-5 text-muted-foreground">
        Taxes and shipping will be calculated later.
      </p>
      <Button type="button" disabled className="mt-6 w-full">
        Checkout unavailable
      </Button>
      <Link
        href="/products"
        className="mt-4 inline-flex text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-offset-4"
      >
        Continue shopping
      </Link>
    </aside>
  );
}
