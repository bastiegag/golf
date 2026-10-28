'use client';

import { useFormStatus } from 'react-dom';
import { Button, type ButtonProps } from './button';
import { Spinner } from './spinner';

type SubmitButtonProps = ButtonProps & {
  pendingText?: string;
};

export function SubmitButton({
  children,
  pendingText = 'Saving…',
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      {...props}
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending || undefined}
    >
      {pending ? (
        <>
          <Spinner size="sm" aria-hidden="true" />
          <span>{pendingText}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
