import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type EmptyStateProps = ComponentPropsWithoutRef<'section'> & {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export const EmptyState = forwardRef<HTMLElement, EmptyStateProps>(
  function EmptyState(
    { className, icon, title, description, action, ...props },
    ref,
  ) {
    return (
      <section
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center rounded-md border border-dashed border-border px-6 py-12 text-center',
          className,
        )}
        {...props}
      >
        {icon ? <div className="mb-4 text-muted-foreground">{icon}</div> : null}
        <h2 className="text-heading-3">{title}</h2>
        {description ? (
          <p className="mt-3 max-w-md text-body-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-6">{action}</div> : null}
      </section>
    );
  },
);
