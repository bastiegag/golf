import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { EmptyState } from './empty-state';
import { ErrorState } from './error-state';
import { LoadingState } from './loading-state';
import { Skeleton } from './skeleton';
import { Spinner } from './spinner';

const meta = {
  title: 'UI/Feedback/Feedback',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Spinners: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner size="sm" color="primary" />
      <Spinner size="md" color="success" />
      <Spinner size="lg" color="warning" />
      <Spinner label="Loading content" />
    </div>
  ),
};

export const Loading: Story = {
  render: () => <LoadingState message="Loading products…" />,
};

export const SkeletonLines: Story = {
  render: () => (
    <div className="max-w-md space-y-3">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  ),
};

export const Alerts: Story = {
  render: () => (
    <div className="grid gap-4">
      {(['info', 'success', 'warning', 'destructive'] as const).map(
        (variant) => (
          <Alert key={variant} variant={variant}>
            <AlertTitle className="capitalize">{variant}</AlertTitle>
            <AlertDescription>
              This is a semantic {variant} message.
            </AlertDescription>
          </Alert>
        ),
      )}
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <EmptyState
      title="Nothing here yet"
      description="When items are available, they will appear in this space."
      action={<Button>Get started</Button>}
    />
  ),
};

export const RecoverableError: Story = {
  render: () => (
    <ErrorState
      title="Could not load this section"
      description="Try again or return to the previous page."
      retryAction={<Button>Try again</Button>}
    />
  ),
};
