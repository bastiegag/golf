export default function ProductsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading products"
      className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20"
    >
      <span className="sr-only">Loading products…</span>
      <div
        aria-hidden="true"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-4">
            <div className="aspect-[4/3] bg-muted motion-safe:animate-pulse" />
            <div className="h-4 w-2/3 bg-muted motion-safe:animate-pulse" />
            <div className="h-4 w-1/3 bg-muted motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
