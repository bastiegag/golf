import Link from 'next/link';
import { formatCents, formatOrderDate, formatOrderStatus } from '../format';
import type { getAdminOrders } from '../queries';

type AdminOrder = Awaited<ReturnType<typeof getAdminOrders>>['orders'][number];

export function OrderTable({ orders }: { orders: AdminOrder[] }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-border bg-background">
      <table className="w-full min-w-[760px] text-left text-sm">
        <caption className="sr-only">Orders</caption>
        <thead className="border-b border-border bg-muted/30">
          <tr>
            {['Order', 'Customer', 'Date', 'Items', 'Total', 'Status', ''].map((heading) => (
              <th key={heading} scope="col" className="px-4 py-3 font-medium">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((order) => (
            <tr key={order.id}>
              <th scope="row" className="px-4 py-4 font-medium">
                <Link href={`/admin/orders/${order.id}`} className="underline underline-offset-4">
                  {order.orderNumber}
                </Link>
              </th>
              <td className="px-4 py-4">
                <div>{order.customerName}</div>
                <div className="text-muted-foreground">{order.customerEmail}</div>
              </td>
              <td className="px-4 py-4">{formatOrderDate(order.createdAt)}</td>
              <td className="px-4 py-4">{order._count.items}</td>
              <td className="px-4 py-4">{formatCents(order.totalCents)}</td>
              <td className="px-4 py-4">{formatOrderStatus(order.status)}</td>
              <td className="px-4 py-4">
                <Link href={`/admin/orders/${order.id}`} className="font-medium underline underline-offset-4">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
