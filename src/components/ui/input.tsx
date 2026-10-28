import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils/cn';

export const Input = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<'input'>>(
  function Input({ className, 'aria-invalid': ariaInvalid, ...props }, ref) {
    return (
      <input
        ref={ref}
        aria-invalid={ariaInvalid}
        className={cn(
          'min-h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-body-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 read-only:bg-muted aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30',
          className,
        )}
        {...props}
      />
    );
  },
);
