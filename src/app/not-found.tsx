export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <p className="mb-4 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
        404
      </p>
      <h1 className="text-4xl font-medium tracking-[-0.045em]">
        Page not found
      </h1>
      <p className="mt-5 text-base leading-7 text-muted-foreground">
        The page you are looking for does not exist or is no longer available.
      </p>
    </div>
  );
}
