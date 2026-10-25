import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckoutForm } from '@/features/checkout/components/checkout-form';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Enter your details to place a simulated order.',
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
      <Link
        href="/cart"
        className="text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-offset-4"
      >
        ← Back to cart
      </Link>
      <div className="mt-10 max-w-2xl">
        <p className="mb-4 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          Secure details
        </p>
        <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
          Checkout
        </h1>
        <p className="mt-5 leading-7 text-muted-foreground">
          This is a simulated checkout. No payment will be processed.
        </p>
        <CheckoutForm />
      </div>
    </div>
  );
}
