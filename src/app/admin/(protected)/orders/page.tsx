import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { getAdminOrders } from '@/features/admin/orders/queries';
import { parseOrderFilters } from '@/features/admin/orders/schemas';
import { ORDER_STATUS_LABELS } from '@/features/admin/orders/transitions';
import { OrderTable } from '@/features/admin/orders/components/order-table';
import { EmptyState } from '@/components/ui/empty-state';

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
        <Field>
          <FieldLabel htmlFor="query">Search</FieldLabel>
          <Input id="query" name="query" defaultValue={filters.query} placeholder="Order number or customer" />
        </Field>
        <Field>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Select id="status" name="status" defaultValue={filters.status ?? ''}>
            <option value="">All statuses</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="from">From</FieldLabel>
          <Input id="from" name="from" type="date" defaultValue={filters.from} />
        </Field>
        <Field>
          <FieldLabel htmlFor="to">To</FieldLabel>
          <Input id="to" name="to" type="date" defaultValue={filters.to} />
        </Field>
        <Button type="submit">Filter</Button>
      </form>
      {result.orders.length ? (
        <OrderTable orders={result.orders} />
      ) : (
        <EmptyState title="No orders match these filters." />
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
