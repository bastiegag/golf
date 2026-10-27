import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatCents, formatOrderDate, formatOrderStatus } from '@/features/admin/orders/format';
import { getAdminOrderById } from '@/features/admin/orders/queries';
import { updateOrderStatusAction } from '@/features/admin/orders/actions';
import { OrderStatusForm } from '@/features/admin/orders/components/status-form';
import { StatusHistory } from '@/features/admin/orders/components/status-history';

export const metadata: Metadata = { title: 'Order details' };
export const dynamic = 'force-dynamic';

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="text-sm font-medium underline underline-offset-4">← Back to orders</Link>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">Order details</p>
          <h1 className="text-4xl font-medium tracking-[-0.045em]">{order.orderNumber}</h1>
          <p className="mt-3 text-muted-foreground">{formatOrderDate(order.createdAt)}</p>
        </div>
        <p className="rounded-full border border-border px-3 py-1 text-sm">{formatOrderStatus(order.status)}</p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section aria-labelledby="customer-heading" className="rounded-sm border border-border bg-background p-5">
            <h2 id="customer-heading" className="text-lg font-medium">Customer and shipping</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {[
                ['Name', order.customerName],
                ['Email', order.customerEmail],
                ['Address', order.shippingAddress],
                ['City', order.shippingCity],
                ['Region', order.shippingRegion],
                ['Postal code', order.shippingPostalCode],
                ['Country', order.shippingCountry],
              ].map(([label, value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="mt-1">{value}</dd></div>)}
            </dl>
          </section>
          <section aria-labelledby="items-heading" className="rounded-sm border border-border bg-background p-5">
            <h2 id="items-heading" className="text-lg font-medium">Purchased items</h2>
            <ul className="mt-4 divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-4 text-sm">
                  <div><p className="font-medium">{item.productNameSnapshot}</p><p className="mt-1 text-muted-foreground">{item.quantity} × {formatCents(item.unitPriceCents)} · {item.productSlugSnapshot}</p></div>
                  <p className="font-medium">{formatCents(item.lineTotalCents)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 border-t border-border pt-4 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCents(order.subtotalCents)}</dd></div>
              <div className="mt-2 flex justify-between font-medium"><dt>Total</dt><dd>{formatCents(order.totalCents)}</dd></div>
            </dl>
          </section>
          <StatusHistory history={order.statusHistory} />
        </div>
        <OrderStatusForm
          orderId={order.id}
          status={order.status}
          action={updateOrderStatusAction}
        />
      </div>
    </div>
  );
}
