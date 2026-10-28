'use client';

import { useRef, useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Select } from '@/components/ui/select';
import type { OrderActionState } from '../schemas';
import {
  getAllowedOrderTransitions,
  ORDER_STATUS_LABELS,
} from '../transitions';
import type { OrderStatus } from '@/generated/prisma/client';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
    >
      {pending ? 'Saving…' : 'Update status'}
    </Button>
  );
}

export function OrderStatusForm({
  orderId,
  status,
  action,
}: {
  orderId: string;
  status: OrderStatus;
  action: (
    previousState: OrderActionState,
    formData: FormData,
  ) => Promise<OrderActionState>;
}) {
  const [state, formAction] = useActionState<OrderActionState, FormData>(
    action,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  const confirmedRef = useRef(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const options = getAllowedOrderTransitions(status);

  return (
    <section aria-labelledby="status-heading" className="rounded-sm border border-border bg-background p-5">
      <h2 id="status-heading" className="text-lg font-medium">Fulfillment status</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Current status: <strong>{ORDER_STATUS_LABELS[status]}</strong>
      </p>
      {options.length ? (
        <>
        <form
          ref={formRef}
          action={formAction}
          className="mt-5 flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            const formData = new FormData(event.currentTarget);
            if (
              formData.get('status') === 'CANCELLED' &&
              !confirmedRef.current
            ) {
              event.preventDefault();
              setCancelDialogOpen(true);
              return;
            }
            confirmedRef.current = false;
          }}
        >
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="expectedStatus" value={status} />
          <Field>
            <FieldLabel htmlFor="next-status">Change to</FieldLabel>
            <Select
              id="next-status"
              name="status"
              defaultValue={options[0]}
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {ORDER_STATUS_LABELS[option]}
                </option>
              ))}
            </Select>
          </Field>
          <SubmitButton />
        </form>
        <AlertDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              Cancellation is permanent and cannot be undone.
            </AlertDialogDescription>
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialogCancel asChild>
                <Button type="button" variant="outline">
                  Keep order
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
                  Cancel order
                </Button>
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
        </>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No further fulfillment transitions are available.
        </p>
      )}
      {state.success ? (
        <p role="status" className="mt-4 text-body-sm text-success">{state.success}</p>
      ) : null}
      {state.message ? (
        <p role="alert" className="mt-4 text-body-sm text-destructive">{state.message}</p>
      ) : null}
    </section>
  );
}
