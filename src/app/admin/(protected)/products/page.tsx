import type { Metadata } from 'next';
import Link from 'next/link';
import { getAdminCategories, getAdminProducts } from '@/features/admin/products/queries';
import { parseProductFilters } from '@/features/admin/products/schemas';
import { ProductTable } from '@/features/admin/products/components/product-table';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export const metadata: Metadata = { title: 'Products' };
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

export default async function AdminProductsPage({ searchParams }: Props) {
  const rawParams = await searchParams;
  const filters = parseProductFilters(rawParams);
  const [result, categories] = await Promise.all([
    getAdminProducts(filters),
    getAdminCategories(),
  ]);
  const pageCount = result.pageCount;
  const currentPage = result.page;
  const baseParams = {
    query: filters.query,
    status: filters.status === 'all' ? '' : filters.status,
    categoryId: filters.categoryId,
  };
  const success = Array.isArray(rawParams.success) ? rawParams.success[0] : rawParams.success;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            Administration
          </p>
          <h1 className="text-4xl font-medium tracking-[-0.045em]">Products</h1>
          <p className="mt-3 text-muted-foreground">{result.total} product{result.total === 1 ? '' : 's'} total</p>
        </div>
        <Button asChild><Link href="/admin/products/new">New product</Link></Button>
      </div>
      {success === 'created' || success === 'updated' ? (
        <p role="status" className="mb-6 rounded-sm border border-success/30 bg-success/10 px-4 py-3 text-body-sm text-success">
          Product {success === 'created' ? 'created' : 'updated'} successfully.
        </p>
      ) : null}
      <form className="mb-8 grid gap-4 rounded-sm border border-border bg-background p-4 sm:grid-cols-[minmax(0,1fr)_160px_220px_auto] sm:items-end">
        <Field>
          <FieldLabel htmlFor="query">Search</FieldLabel>
          <Input id="query" name="query" defaultValue={filters.query} placeholder="Name or slug" />
        </Field>
        <Field>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Select id="status" name="status" defaultValue={filters.status}>
            <option value="all">All</option><option value="active">Active</option><option value="inactive">Inactive</option>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="categoryId">Category</FieldLabel>
          <Select id="categoryId" name="categoryId" defaultValue={filters.categoryId}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </Select>
        </Field>
        <Button type="submit">Filter</Button>
      </form>
      {result.products.length ? (
        <ProductTable products={result.products} />
      ) : (
        <p className="rounded-sm border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
          {result.total === 0 ? 'No products match these filters.' : 'No products on this page.'}
        </p>
      )}
      <nav aria-label="Product pages" className="mt-6 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Page {currentPage} of {pageCount}</span>
        <div className="flex gap-4">
          {currentPage > 1 ? <Link className="font-medium underline underline-offset-4" href={`/admin/products?${queryString(baseParams, { page: String(currentPage - 1) })}`}>Previous</Link> : <span className="text-muted-foreground">Previous</span>}
          {currentPage < pageCount ? <Link className="font-medium underline underline-offset-4" href={`/admin/products?${queryString(baseParams, { page: String(currentPage + 1) })}`}>Next</Link> : <span className="text-muted-foreground">Next</span>}
        </div>
      </nav>
    </div>
  );
}
