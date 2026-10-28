import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils/cn';

export const Skeleton = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<'div'>
>(function Skeleton({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-md bg-muted motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  );
});
