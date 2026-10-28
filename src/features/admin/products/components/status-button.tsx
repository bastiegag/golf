'use client';

import { forwardRef, useRef, useState, type ButtonHTMLAttributes } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toggleProductStatusAction } from '../actions';

const StatusSubmitButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    isActive: boolean;
    type?: 'button' | 'submit';
  }
>(function StatusSubmitButton({
  isActive,
  type = 'submit',
  ...props
}, ref) {
  const { pending } = useFormStatus();
  return (
    <Button
      {...props}
      ref={ref}
      type={type}
      variant="outline"
      disabled={pending || props.disabled}
    >
      {pending
        ? 'Saving…'
        : isActive
          ? 'Deactivate'
          : 'Activate'}
    </Button>
  );
});

export function StatusButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const confirmedRef = useRef(false);
  const [open, setOpen] = useState(false);

  return (
    <form
      ref={formRef}
      action={toggleProductStatusAction}
      onSubmit={(event) => {
        if (isActive && !confirmedRef.current) {
          event.preventDefault();
          setOpen(true);
          return;
        }
        confirmedRef.current = false;
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="isActive" value={String(!isActive)} />
      {isActive ? (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <StatusSubmitButton isActive={isActive} type="button" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Deactivate this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This product will no longer appear in the public storefront.
            </AlertDialogDescription>
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialogCancel asChild>
                <Button type="button" variant="outline">
                  Keep active
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction
                asChild
                onClick={() => {
                  confirmedRef.current = true;
                  formRef.current?.requestSubmit();
                }}
              >
                <Button type="button" variant="destructive">
                  Deactivate
                </Button>
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <StatusSubmitButton isActive={isActive} />
      )}
    </form>
  );
}
