import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatCents } from '@/features/cart/utils';
import { getOrderForConfirmation } from '@/features/checkout/queries/get-order';

type ConfirmationPageProps = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
};

export const metadata: Metadata = {
  title: 'Order confirmation',
  description: 'Your Golf order confirmation.',
  referrer: 'no-referrer',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: ConfirmationPageProps) {
  const [{ orderNumber }, { token: rawToken }] = await Promise.all([
    params,
    searchParams,
  ]);
  const token = Array.isArray(rawToken) ? undefined : rawToken;

  if (!token) {
    notFound();
  }

  const order = await getOrderForConfirmation(orderNumber, token);

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
      <p className="mb-4 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
        Order confirmed
      </p>
      <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
        Thank you, {order.customerName}.
      </h1>
      <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
        Your simulated order has been placed. Keep this confirmation for your
        records.
      </p>

      <dl className="mt-10 grid gap-4 border-y border-border py-6 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Order number</dt>
          <dd className="mt-1 font-medium">{order.orderNumber}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Status</dt>
          <dd className="mt-1 font-medium">{order.status}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Total</dt>
          <dd className="mt-1 font-medium">{formatCents(order.totalCents)}</dd>
        </div>
      </dl>

      <section aria-labelledby="confirmation-items-heading" className="mt-10">
        <h2 id="confirmation-items-heading" className="text-xl font-medium">
          Items
        </h2>
        <ul className="mt-5 divide-y divide-border border-y border-border">
          {order.items.map((item) => (
            <li
              key={`${item.productSlugSnapshot}-${item.quantity}`}
              className="flex justify-between gap-4 py-4 text-sm"
            >
              <div>
                <Link
                  href={`/products/${item.productSlugSnapshot}`}
                  className="font-medium hover:text-accent focus-visible:outline-offset-4"
                >
                  {item.productNameSnapshot}
                </Link>
                <p className="mt-1 text-muted-foreground">
                  {item.quantity} × {formatCents(item.unitPriceCents)}
                </p>
              </div>
              <p className="font-medium">{formatCents(item.lineTotalCents)}</p>
            </li>
          ))}
        </ul>
      </section>

      <Link
        href="/products"
        className="mt-10 inline-flex text-sm font-medium underline underline-offset-4 hover:text-accent focus-visible:outline-offset-4"
      >
        Continue shopping
      </Link>
    </div>
  );
}
