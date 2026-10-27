import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/features/admin/products/components/product-form';
import { updateProductAction } from '@/features/admin/products/actions';
import { getAdminCategories, getAdminProductById } from '@/features/admin/products/queries';

export const metadata: Metadata = { title: 'Edit product' };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getAdminProductById(id), getAdminCategories()]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/products" className="text-sm text-muted-foreground underline underline-offset-4">← Back to products</Link>
      <h1 className="mt-6 text-4xl font-medium tracking-[-0.045em]">Edit product</h1>
      <p className="mt-3 mb-10 text-muted-foreground">Update catalogue details for {product.name}.</p>
      <ProductForm
        categories={categories}
        initialValues={product}
        action={updateProductAction.bind(null, id)}
        submitLabel="Save changes"
      />
    </div>
  );
}
