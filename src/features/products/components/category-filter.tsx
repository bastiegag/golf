import Link from 'next/link';

type CategoryFilterCategory = {
  name: string;
  slug: string;
};

type CategoryFilterProps = {
  categories: CategoryFilterCategory[];
  selectedCategory?: string;
  isInvalidCategory?: boolean;
};

export function CategoryFilter({
  categories,
  selectedCategory,
  isInvalidCategory = false,
}: CategoryFilterProps) {
  const isAllSelected = !selectedCategory && !isInvalidCategory;

  return (
    <nav aria-label="Filter products by category">
      <ul className="flex list-none flex-wrap gap-2 p-0">
        <li>
          <Link
            href="/products"
            aria-current={isAllSelected ? 'page' : undefined}
            className={`inline-flex rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-offset-2 ${
              isAllSelected
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
            }`}
          >
            All products
          </Link>
        </li>
        {categories.map((category) => {
          const isSelected = selectedCategory === category.slug;

          return (
            <li key={category.slug}>
              <Link
                href={`/products?category=${category.slug}`}
                aria-current={isSelected ? 'page' : undefined}
                className={`inline-flex rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-offset-2 ${
                  isSelected
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                }`}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
