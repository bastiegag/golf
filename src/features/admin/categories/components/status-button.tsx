'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { toggleCategoryStatusAction } from '../actions';

function StatusSubmitButton({ isActive }: { isActive: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? 'Saving…' : isActive ? 'Deactivate' : 'Activate'}
    </Button>
  );
}

export function StatusButton({
  id,
  isActive,
  productCount,
}: {
  id: string;
  isActive: boolean;
  productCount: number;
}) {
  return (
    <form
      action={toggleCategoryStatusAction}
      onSubmit={(event) => {
        if (
          isActive &&
          productCount > 0 &&
          !window.confirm(
            `Deactivating this category hides ${productCount} product${
              productCount === 1 ? '' : 's'
            } from the storefront. Continue?`,
          )
        ) {
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
