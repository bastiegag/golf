import { formatOrderDate, formatOrderStatus } from '../format';
import type { getAdminOrderById } from '../queries';

type History = NonNullable<Awaited<ReturnType<typeof getAdminOrderById>>>['statusHistory'];

export function StatusHistory({ history }: { history: History }) {
  return (
    <section aria-labelledby="history-heading" className="rounded-sm border border-border bg-background p-5">
      <h2 id="history-heading" className="text-lg font-medium">Status history</h2>
      {history.length ? (
        <ol className="mt-4 divide-y divide-border">
          {history.map((entry) => (
            <li key={entry.id} className="py-3 text-sm">
              <p>
                {formatOrderStatus(entry.previousStatus)} → {formatOrderStatus(entry.newStatus)}
              </p>
              <p className="mt-1 text-muted-foreground">
                {formatOrderDate(entry.createdAt)}
                {entry.administrator
                  ? ` by ${entry.administrator.name || entry.administrator.email}`
                  : ''}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">No status changes recorded.</p>
      )}
    </section>
  );
}
