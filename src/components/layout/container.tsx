import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils/cn';

type ContainerProps = ComponentPropsWithoutRef<'div'> & {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  centered?: boolean;
};

const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
} as const;

const paddingClasses = {
  none: 'px-0',
  sm: 'px-4 sm:px-6',
  md: 'px-5 sm:px-8',
  lg: 'px-6 sm:px-10 lg:px-12',
} as const;

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  function Container(
    { size = 'xl', padding = 'md', centered = true, className, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          sizeClasses[size],
          paddingClasses[padding],
          centered && 'mx-auto',
          className,
        )}
        {...props}
      />
    );
  },
);
