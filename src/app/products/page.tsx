import type { Metadata } from 'next';
import { CategoryFilter } from '@/features/products/components/category-filter';
import { ProductCard } from '@/features/products/components/product-card';
import { Container } from '@/components/layout/container';
import { EmptyState } from '@/components/ui/empty-state';
import {
  getActiveCategories,
  getActiveProducts,
} from '@/features/products/queries/get-products';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Explore our considered collection of everyday goods.',
};

type ProductsPageProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

function getCategorySlug(category: string | string[] | undefined) {
  return Array.isArray(category) ? category[0] : category;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { category } = await searchParams;
  const categorySlug = getCategorySlug(category);
  const [products, categories] = await Promise.all([
    getActiveProducts(categorySlug),
    getActiveCategories(),
  ]);
  const selectedCategory = categories.some(
    (availableCategory) => availableCategory.slug === categorySlug,
  )
    ? categorySlug
    : undefined;
  const isInvalidCategory = Boolean(categorySlug && !selectedCategory);
  const emptyMessage = categorySlug
    ? 'No products found for this category.'
    : 'No products yet. Connect PostgreSQL and run the seed command to stock the store.';

  return (
    <Container className="py-16 sm:py-20">
      <div className="mb-8 max-w-2xl">
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

      <div className="mb-12">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          isInvalidCategory={isInvalidCategory}
        />
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
        <EmptyState title={categorySlug ? 'No products found' : 'No products yet'} description={emptyMessage} />
      )}
    </Container>
  );
}
