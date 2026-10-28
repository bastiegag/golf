import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { Spinner } from './spinner';
import { cn } from '@/lib/utils/cn';

type LoadingStateProps = ComponentPropsWithoutRef<'div'> & {
  message?: string;
};

export const LoadingState = forwardRef<HTMLDivElement, LoadingStateProps>(
  function LoadingState({ className, message = 'Loading…', ...props }, ref) {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={cn(
          'flex items-center justify-center gap-3 p-6 text-body-sm text-muted-foreground',
          className,
        )}
        {...props}
      >
        <Spinner aria-hidden="true" />
        <span>{message}</span>
      </div>
    );
  },
);
