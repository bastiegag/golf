import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CategoryForm } from '@/features/admin/categories/components/category-form';
import { updateCategoryAction } from '@/features/admin/categories/actions';
import { getAdminCategoryById } from '@/features/admin/categories/queries';

export const metadata: Metadata = { title: 'Edit category' };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getAdminCategoryById(id);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/categories" className="text-sm text-muted-foreground underline underline-offset-4">
        ← Back to categories
      </Link>
      <h1 className="mt-6 text-4xl font-medium tracking-[-0.045em]">Edit category</h1>
      <p className="mt-3 mb-10 text-muted-foreground">
        Update catalogue organization for {category.name}.
      </p>
      <CategoryForm
        initialValues={{
          name: category.name,
          slug: category.slug,
          isActive: category.isActive,
        }}
        action={updateCategoryAction.bind(null, id)}
        submitLabel="Save changes"
      />
    </div>
  );
}
