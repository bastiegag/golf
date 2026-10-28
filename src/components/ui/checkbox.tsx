'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ComponentPropsWithoutRef,
} from 'react';
import { cn } from '@/lib/utils/cn';

type CheckboxProps = ComponentPropsWithoutRef<'input'> & {
  indeterminate?: boolean;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { className, indeterminate = false, 'aria-invalid': ariaInvalid, ...props },
    ref,
  ) {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current!, []);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <input
        {...props}
        ref={inputRef}
        type="checkbox"
        aria-invalid={ariaInvalid}
        className={cn(
          'size-4 rounded-sm border border-input accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/30',
          className,
        )}
      />
    );
  },
);
