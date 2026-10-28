import { Container } from '@/components/layout/container';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsLoading() {
  return (
    <Container
      aria-busy="true"
      aria-label="Loading products"
      className="py-16 sm:py-20"
    >
      <div
        aria-hidden="true"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="aspect-[4/3]" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </Container>
  );
}
