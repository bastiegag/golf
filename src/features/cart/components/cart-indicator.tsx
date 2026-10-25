'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/features/cart/context';

export function CartIndicator() {
  const { itemCount, isHydrated } = useCart();
  const label = isHydrated ? `Cart (${itemCount} items)` : 'Cart';

  return (
    <Link
      href="/cart"
      aria-label={label}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-offset-4"
    >
      <ShoppingBag aria-hidden="true" size={18} />
      <span className="hidden sm:inline">Cart</span>
      <span aria-hidden="true">({isHydrated ? itemCount : 0})</span>
    </Link>
  );
}
