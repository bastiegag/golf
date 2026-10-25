import { MAX_CART_QUANTITY } from './constants';
import type { CartAction, CartState } from './types';
import { isPositiveInteger } from './utils';

export const initialCartState: CartState = { items: [] };

export function cartReducer(
  state: CartState,
  action: CartAction,
): CartState {
  switch (action.type) {
    case 'add': {
      const existingItem = state.items.find(
        (item) => item.productId === action.product.productId,
      );

      if (!existingItem) {
        return {
          items: [...state.items, { ...action.product, quantity: 1 }],
        };
      }

      return {
        items: state.items.map((item) =>
          item.productId === action.product.productId
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, MAX_CART_QUANTITY),
              }
            : item,
        ),
      };
    }
    case 'remove':
      return {
        items: state.items.filter((item) => item.productId !== action.productId),
      };
    case 'updateQuantity':
      if (
        !isPositiveInteger(action.quantity) ||
        action.quantity > MAX_CART_QUANTITY
      ) {
        return state;
      }

      return {
        items: state.items.map((item) =>
          item.productId === action.productId
            ? { ...item, quantity: action.quantity }
            : item,
        ),
      };
    case 'clear':
      return initialCartState;
    case 'hydrate':
      return { items: action.items };
    default:
      return state;
  }
}
