'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section
      role="alert"
      className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-start justify-center px-5 py-16"
    >
      <p className="mb-4 text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
        Something went wrong
      </p>
      <h1 className="text-3xl font-medium tracking-[-0.04em]">
        We couldn’t load this page.
      </h1>
      <p className="mt-4 text-muted-foreground">
        Please try again. If the problem continues, come back in a little while.
      </p>
      <Button className="mt-7" onClick={reset}>
        Try again
      </Button>
    </section>
  );
}
