import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-sm text-sm font-medium transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#829c88] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-accent px-5 py-3 text-accent-foreground hover:bg-[#294735]',
        outline:
          'border border-border bg-transparent px-5 py-3 text-foreground hover:bg-muted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  asChild = false,
  className,
  variant,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    />
  );
}
