import type { Metadata } from 'next';
import Link from 'next/link';
import { CategoryForm } from '@/features/admin/categories/components/category-form';
import { createCategoryAction } from '@/features/admin/categories/actions';

export const metadata: Metadata = { title: 'New category' };

export default function NewCategoryPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/categories" className="text-sm text-muted-foreground underline underline-offset-4">
        ← Back to categories
      </Link>
      <h1 className="mt-6 text-4xl font-medium tracking-[-0.045em]">New category</h1>
      <p className="mt-3 mb-10 text-muted-foreground">Add a category to organize the catalogue.</p>
      <CategoryForm
        initialValues={{ name: '', slug: '', isActive: true }}
        action={createCategoryAction}
        submitLabel="Create category"
      />
    </div>
  );
}
