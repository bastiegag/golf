import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductForm } from '@/features/admin/products/components/product-form';
import { createProductAction } from '@/features/admin/products/actions';
import { getAdminCategories } from '@/features/admin/products/queries';

export const metadata: Metadata = { title: 'New product' };

export default async function NewProductPage() {
  const categories = await getAdminCategories();
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/products" className="text-sm text-muted-foreground underline underline-offset-4">← Back to products</Link>
      <h1 className="mt-6 text-4xl font-medium tracking-[-0.045em]">New product</h1>
      <p className="mt-3 mb-10 text-muted-foreground">Add a product to the catalogue.</p>
      <ProductForm
        categories={categories}
        initialValues={{ name: '', slug: '', description: '', price: '', imageUrl: '/products/placeholder.svg', categoryId: '', isActive: true }}
        action={createProductAction}
        submitLabel="Create product"
      />
    </div>
  );
}
