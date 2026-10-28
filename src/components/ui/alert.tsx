import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils/cn';

type AlertProps = ComponentPropsWithoutRef<'div'> & {
  variant?: 'info' | 'success' | 'warning' | 'destructive';
  role?: 'alert' | 'status' | 'region';
};

const variantClasses = {
  info: 'border-info/30 bg-info/10 text-info',
  success: 'border-success/30 bg-success/10 text-success',
  warning:
    'border-warning/30 bg-warning/10 text-warning-subtle-foreground',
  destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
} as const;

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { className, variant = 'info', ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-md border px-4 py-3 text-body-sm',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
});

export const AlertTitle = forwardRef<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<'h3'>
>(function AlertTitle({ className, ...props }, ref) {
  return (
    <h3 ref={ref} className={cn('font-medium', className)} {...props} />
  );
});

export const AlertDescription = forwardRef<
  HTMLParagraphElement,
  ComponentPropsWithoutRef<'p'>
>(function AlertDescription({ className, ...props }, ref) {
  return (
    <p ref={ref} className={cn('mt-1', className)} {...props} />
  );
});
