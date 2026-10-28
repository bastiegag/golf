import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { Label } from './label';

type FieldProps = ComponentPropsWithoutRef<'div'> & {
  required?: boolean;
};

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { className, required = false, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-required={required || undefined}
      className={cn('space-y-2', className)}
      {...props}
    />
  );
});

type FieldLabelProps = ComponentPropsWithoutRef<typeof Label> & {
  required?: boolean;
  optional?: boolean;
};

export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(
  function FieldLabel(
    { children, required = false, optional = false, ...props },
    ref,
  ) {
    return (
      <Label ref={ref} {...props}>
        {children}
        {required && (
          <span aria-hidden="true" className="ml-1 text-destructive">
            *
          </span>
        )}
        {optional && (
          <span className="ml-1 font-normal text-muted-foreground">
            (optional)
          </span>
        )}
      </Label>
    );
  },
);

export const FieldDescription = forwardRef<
  HTMLParagraphElement,
  ComponentPropsWithoutRef<'p'>
>(function FieldDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={cn('text-body-sm text-muted-foreground', className)}
      {...props}
    />
  );
});

export const FieldError = forwardRef<
  HTMLParagraphElement,
  ComponentPropsWithoutRef<'p'>
>(function FieldError({ className, children, ...props }, ref) {
  if (!children) {
    return null;
  }

  return (
    <p
      ref={ref}
      className={cn('text-body-sm text-destructive', className)}
      {...props}
    >
      {children}
    </p>
  );
});
