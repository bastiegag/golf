import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getActiveProductBySlug } from '@/features/products/queries/get-product';
import { formatPrice } from '@/features/products/utils/format-price';

export const dynamic = 'force-dynamic';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getActiveProductBySlug(slug);

  if (!product) {
    return {};
  }

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getActiveProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-20">
      <Link
        href="/products"
        className="mb-10 inline-flex text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-offset-4"
      >
        ← Back to the collection
      </Link>
      <article className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center lg:gap-20">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="max-w-xl">
          <p className="mb-4 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            The collection
          </p>
          <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            {product.description}
          </p>
          <p className="mt-8 text-lg font-medium">
            {formatPrice(product.price)}
          </p>
        </div>
      </article>
    </div>
  );
}
