import type { Metadata } from 'next';
import { ProductCard } from '@/features/products/components/product-card';
import { getActiveProducts } from '@/features/products/queries/get-products';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Explore our considered collection of everyday goods.',
};

export default async function ProductsPage() {
  const products = await getActiveProducts();

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="mb-12 max-w-2xl">
        <p className="mb-4 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          The collection
        </p>
        <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
          Thoughtful things for everyday.
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">
          A small collection of useful goods, made to fit naturally into your
          day.
        </p>
      </div>

      {products.length > 0 ? (
        <ul className="grid list-none grid-cols-1 gap-x-6 gap-y-10 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-sm border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
          No products yet. Connect PostgreSQL and run the seed command to stock
          the store.
        </p>
      )}
    </div>
  );
}
