import { describe, expect, it } from 'vitest';
import { OrderStatus } from '@/generated/prisma/client';
import {
  getAllowedOrderTransitions,
  getOrderTransitionError,
  isAllowedOrderTransition,
} from './transitions';

describe('order status transitions', () => {
  it('allows only the documented forward fulfillment transitions', () => {
    expect(getAllowedOrderTransitions(OrderStatus.PENDING)).toEqual([
      OrderStatus.PROCESSING,
      OrderStatus.CANCELLED,
    ]);
    expect(isAllowedOrderTransition(OrderStatus.PROCESSING, OrderStatus.SHIPPED)).toBe(true);
    expect(isAllowedOrderTransition(OrderStatus.SHIPPED, OrderStatus.DELIVERED)).toBe(true);
    expect(isAllowedOrderTransition(OrderStatus.PENDING, OrderStatus.DELIVERED)).toBe(false);
    expect(isAllowedOrderTransition(OrderStatus.SHIPPED, OrderStatus.PROCESSING)).toBe(false);
  });

  it('treats delivered and cancelled orders as terminal', () => {
    expect(getAllowedOrderTransitions(OrderStatus.DELIVERED)).toEqual([]);
    expect(getAllowedOrderTransitions(OrderStatus.CANCELLED)).toEqual([]);
    expect(getOrderTransitionError(OrderStatus.DELIVERED, OrderStatus.CANCELLED)).toContain(
      'cannot move',
    );
  });
});
