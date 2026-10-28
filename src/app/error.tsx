'use client';

import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      className="mx-auto max-w-xl"
      title="We couldn’t load this page."
      retryAction={<Button onClick={reset}>Try again</Button>}
    />
  );
}
