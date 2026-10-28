import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getAdminCategories } from '@/features/admin/categories/queries';
import { CategoryTable } from '@/features/admin/categories/components/category-table';
import { EmptyState } from '@/components/ui/empty-state';

export const metadata: Metadata = { title: 'Categories' };
export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string | string[] }>;
}) {
  const categories = await getAdminCategories();
  const rawSuccess = (await searchParams).success;
  const success = Array.isArray(rawSuccess) ? rawSuccess[0] : rawSuccess;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            Administration
          </p>
          <h1 className="text-4xl font-medium tracking-[-0.045em]">Categories</h1>
          <p className="mt-3 text-muted-foreground">
            {categories.length} categor{categories.length === 1 ? 'y' : 'ies'}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">New category</Link>
        </Button>
      </div>
      {success === 'created' || success === 'updated' ? (
        <p
          role="status"
          className="mb-6 rounded-sm border border-success/30 bg-success/10 px-4 py-3 text-body-sm text-success"
        >
          Category {success === 'created' ? 'created' : 'updated'} successfully.
        </p>
      ) : null}
      {categories.length > 0 ? (
        <CategoryTable categories={categories} />
      ) : (
        <EmptyState title="No categories yet." />
      )}
    </div>
  );
}
