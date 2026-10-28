import {
  forwardRef,
  type ComponentPropsWithoutRef,
} from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type IconProps = Omit<ComponentPropsWithoutRef<'svg'>, 'color'> & {
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'current' | 'muted' | 'success' | 'warning' | 'destructive' | 'info';
};

const sizeClasses = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-8',
} as const;

const colorClasses = {
  current: 'text-current',
  muted: 'text-muted-foreground',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
  info: 'text-info',
} as const;

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  {
    icon: IconComponent,
    size = 'md',
    color = 'current',
    className,
    'aria-label': ariaLabel,
    ...props
  },
  ref,
) {
  return (
    <IconComponent
      ref={ref}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
      className={cn(sizeClasses[size], colorClasses[color], className)}
      {...props}
    />
  );
});
