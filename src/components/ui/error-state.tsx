import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type ErrorStateProps = ComponentPropsWithoutRef<'section'> & {
  title?: string;
  description?: string;
  retryAction?: ReactNode;
  navigationAction?: ReactNode;
};

export const ErrorState = forwardRef<HTMLElement, ErrorStateProps>(
  function ErrorState(
    {
      className,
      title = 'Something went wrong',
      description = 'Please try again. If the problem continues, come back in a little while.',
      retryAction,
      navigationAction,
      ...props
    },
    ref,
  ) {
    return (
      <section
        ref={ref}
        role="alert"
        tabIndex={-1}
        className={cn(
          'flex min-h-[30vh] flex-col items-start justify-center px-5 py-16',
          className,
        )}
        {...props}
      >
        <h1 className="text-heading-1">{title}</h1>
        <p className="mt-4 max-w-xl text-body text-muted-foreground">
          {description}
        </p>
        {retryAction || navigationAction ? (
          <div className="mt-7 flex flex-wrap gap-3">
            {retryAction}
            {navigationAction}
          </div>
        ) : null}
      </section>
    );
  },
);
