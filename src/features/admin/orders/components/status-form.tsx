'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
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
      onClick={(event) => {
        if (
          event.currentTarget.form?.elements.namedItem('status') instanceof
            HTMLSelectElement &&
          (event.currentTarget.form?.elements.namedItem('status') as HTMLSelectElement)
            .value === 'CANCELLED' &&
          !window.confirm('Cancel this order? This action cannot be undone.')
        ) {
          event.preventDefault();
        }
      }}
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
  const options = getAllowedOrderTransitions(status);

  return (
    <section aria-labelledby="status-heading" className="rounded-sm border border-border bg-background p-5">
      <h2 id="status-heading" className="text-lg font-medium">Fulfillment status</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Current status: <strong>{ORDER_STATUS_LABELS[status]}</strong>
      </p>
      {options.length ? (
        <form
          action={formAction}
          className="mt-5 flex flex-wrap items-end gap-3"
        >
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="expectedStatus" value={status} />
          <div>
            <label htmlFor="next-status" className="mb-2 block text-sm font-medium">
              Change to
            </label>
            <select
              id="next-status"
              name="status"
              defaultValue={options[0]}
              className="rounded-sm border border-border bg-background px-3 py-2.5"
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {ORDER_STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </div>
          <SubmitButton />
        </form>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No further fulfillment transitions are available.
        </p>
      )}
      {state.success ? (
        <p role="status" className="mt-4 text-sm text-green-800">{state.success}</p>
      ) : null}
      {state.message ? (
        <p role="alert" className="mt-4 text-sm text-red-800">{state.message}</p>
      ) : null}
    </section>
  );
}
