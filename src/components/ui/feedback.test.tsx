import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Alert, AlertDescription } from './alert';
import { EmptyState } from './empty-state';
import { ErrorState } from './error-state';
import { Icon } from './icon';
import { LoadingState } from './loading-state';
import { Skeleton } from './skeleton';
import { CheckCircle } from 'lucide-react';

describe('feedback primitives', () => {
  it('hides decorative icons and labels meaningful icons', () => {
    const { rerender } = render(<Icon icon={CheckCircle} data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true');

    rerender(<Icon icon={CheckCircle} aria-label="Complete" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveAttribute('role', 'img');
    expect(screen.getByTestId('icon')).toHaveAccessibleName('Complete');
  });

  it('exposes loading status while hiding decorative spinner internals', () => {
    render(<LoadingState message="Loading products" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading products');
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('keeps skeletons decorative', () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders alert variants without forcing an assertive role', () => {
    render(
      <Alert variant="warning">
        <AlertDescription>Review this message.</AlertDescription>
      </Alert>,
    );
    expect(screen.getByText('Review this message.')).toBeInTheDocument();
    expect(screen.getByText('Review this message.').parentElement).not.toHaveAttribute(
      'role',
      'alert',
    );
  });

  it('supports empty and error actions', () => {
    const retry = vi.fn();
    render(
      <>
        <EmptyState title="No items" />
        <ErrorState retryAction={<button onClick={retry}>Retry</button>} />
      </>,
    );
    expect(screen.getByRole('heading', { name: 'No items' })).toBeInTheDocument();
    screen.getByRole('button', { name: 'Retry' }).click();
    expect(retry).toHaveBeenCalledOnce();
  });
});
