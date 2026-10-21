import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

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
          <span
            aria-label="Cart (coming soon)"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground"
          >
            <ShoppingBag aria-hidden="true" size={18} />
            <span className="hidden sm:inline">Cart</span>
          </span>
        </nav>
      </div>
    </header>
  );
}
