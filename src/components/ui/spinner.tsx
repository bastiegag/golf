import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils/cn';

type SpinnerProps = ComponentPropsWithoutRef<'span'> & {
  size?: 'sm' | 'md' | 'lg';
  color?: 'current' | 'muted' | 'primary' | 'success' | 'warning' | 'destructive';
  label?: string;
};

const sizeClasses = {
  sm: 'size-4 border-2',
  md: 'size-5 border-2',
  lg: 'size-8 border-[3px]',
} as const;

const colorClasses = {
  current: 'border-current border-t-transparent',
  muted: 'border-muted-foreground border-t-transparent',
  primary: 'border-primary border-t-transparent',
  success: 'border-success border-t-transparent',
  warning: 'border-warning border-t-transparent',
  destructive: 'border-destructive border-t-transparent',
} as const;

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { className, size = 'md', color = 'current', label, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        'inline-block shrink-0 animate-spin rounded-full motion-reduce:animate-none',
        sizeClasses[size],
        colorClasses[color],
        className,
      )}
      {...props}
    />
  );
});
