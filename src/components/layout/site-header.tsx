import Link from 'next/link';
import { CartIndicator } from '@/features/cart/components/cart-indicator';

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="text-xl font-semibold tracking-[0.16em]"
          aria-label="Golf home"
        >
          GOLF
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-7">
          <Link
            href="/products"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Shop
          </Link>
          <CartIndicator />
        </nav>
      </div>
    </header>
  );
}
