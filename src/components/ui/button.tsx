import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary px-5 py-3 text-primary-foreground hover:bg-primary/90',
        secondary:
          'bg-secondary px-5 py-3 text-secondary-foreground hover:bg-secondary/80',
        outline:
          'border border-border bg-transparent px-5 py-3 text-foreground hover:bg-muted',
        ghost:
          'px-5 py-3 text-foreground hover:bg-muted hover:text-foreground',
        destructive:
          'bg-destructive px-5 py-3 text-destructive-foreground hover:bg-destructive/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type ButtonProps = ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ asChild = false, className, variant, ...props }, ref) {
    const Component = asChild ? Slot : 'button';

    return (
      <Component
        ref={ref}
        className={cn(buttonVariants({ variant, className }))}
        {...props}
      />
    );
  },
);
