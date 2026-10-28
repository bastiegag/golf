'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      closeButton
      toastOptions={{
        classNames: {
          toast: 'border-border bg-surface text-foreground',
          description: 'text-muted-foreground',
          success: 'border-success/30',
          error: 'border-destructive/30',
          warning: 'border-warning/30',
          info: 'border-info/30',
        },
      }}
    />
  );
}
