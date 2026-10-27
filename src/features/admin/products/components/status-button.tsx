'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { toggleProductStatusAction } from '../actions';

function StatusSubmitButton({ isActive }: { isActive: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending
        ? 'Saving…'
        : isActive
          ? 'Deactivate'
          : 'Activate'}
    </Button>
  );
}

export function StatusButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  return (
    <form
      action={toggleProductStatusAction}
      onSubmit={(event) => {
        if (isActive && !window.confirm('Deactivate this product from the storefront?')) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="isActive" value={String(!isActive)} />
      <StatusSubmitButton isActive={isActive} />
    </form>
  );
}
