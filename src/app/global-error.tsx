'use client';

import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import './globals.css';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorState
          title="We couldn’t load Golf."
          retryAction={<Button onClick={reset}>Try again</Button>}
        />
      </body>
    </html>
  );
}
