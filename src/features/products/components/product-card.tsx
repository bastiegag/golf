import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/features/products/utils/format-price';

export type ProductCardProduct = {
  slug: string;
  name: string;
  description: string;
  price: number | string;
  imageUrl: string;
  category: {
    name: string;
    slug: string;
  };
};

type ProductCardProps = {
  product: ProductCardProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-sm focus-visible:outline-offset-4"
    >
      <article>
        <div className="relative mb-5 aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={640}
            height={480}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-medium">{product.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.description}
            </p>
          </div>
          <p className="shrink-0 text-sm font-medium">
            {formatPrice(product.price)}
          </p>
        </div>
      </article>
    </Link>
  );
}
