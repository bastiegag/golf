import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getAdminOrders } from '@/features/admin/orders/queries';
import { parseOrderFilters } from '@/features/admin/orders/schemas';
import { ORDER_STATUS_LABELS } from '@/features/admin/orders/transitions';
import { OrderTable } from '@/features/admin/orders/components/order-table';

export const metadata: Metadata = { title: 'Orders' };
export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function queryString(params: Record<string, string>, overrides: Record<string, string>) {
  const next = new URLSearchParams(params);
  Object.entries(overrides).forEach(([key, value]) => {
    if (value) next.set(key, value);
    else next.delete(key);
  });
  return next.toString();
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const rawParams = await searchParams;
  const filters = parseOrderFilters(rawParams);
  const result = await getAdminOrders(filters);
  const params = {
    query: filters.query,
    status: filters.status ?? '',
    from: filters.from ?? '',
    to: filters.to ?? '',
  };

  return (
    <div>
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          Administration
        </p>
        <h1 className="text-4xl font-medium tracking-[-0.045em]">Orders</h1>
        <p className="mt-3 text-muted-foreground">{result.total} order{result.total === 1 ? '' : 's'} total</p>
      </div>
      <form className="mb-8 grid gap-4 rounded-sm border border-border bg-background p-4 sm:grid-cols-[minmax(0,1fr)_160px_160px_160px_auto] sm:items-end">
        <div>
          <label htmlFor="query" className="mb-2 block text-sm font-medium">Search</label>
          <input id="query" name="query" defaultValue={filters.query} placeholder="Order number or customer" className="w-full rounded-sm border border-border bg-background px-3 py-2.5" />
        </div>
        <div>
          <label htmlFor="status" className="mb-2 block text-sm font-medium">Status</label>
          <select id="status" name="status" defaultValue={filters.status ?? ''} className="w-full rounded-sm border border-border bg-background px-3 py-2.5">
            <option value="">All statuses</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="from" className="mb-2 block text-sm font-medium">From</label>
          <input id="from" name="from" type="date" defaultValue={filters.from} className="w-full rounded-sm border border-border bg-background px-3 py-2.5" />
        </div>
        <div>
          <label htmlFor="to" className="mb-2 block text-sm font-medium">To</label>
          <input id="to" name="to" type="date" defaultValue={filters.to} className="w-full rounded-sm border border-border bg-background px-3 py-2.5" />
        </div>
        <Button type="submit">Filter</Button>
      </form>
      {result.orders.length ? (
        <OrderTable orders={result.orders} />
      ) : (
        <p className="rounded-sm border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
          No orders match these filters.
        </p>
      )}
      <nav aria-label="Order pages" className="mt-6 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Page {result.page} of {result.pageCount}</span>
        <div className="flex gap-4">
          {result.page > 1 ? <Link className="font-medium underline underline-offset-4" href={`/admin/orders?${queryString(params, { page: String(result.page - 1) })}`}>Previous</Link> : <span className="text-muted-foreground">Previous</span>}
          {result.page < result.pageCount ? <Link className="font-medium underline underline-offset-4" href={`/admin/orders?${queryString(params, { page: String(result.page + 1) })}`}>Next</Link> : <span className="text-muted-foreground">Next</span>}
        </div>
      </nav>
    </div>
  );
}
