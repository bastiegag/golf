'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import { cartReducer, initialCartState } from './reducer';
import { loadCartItems, saveCartItems } from './storage';
import type { CartProduct, CartState } from './types';
import { calculateItemCount, calculateSubtotalCents } from './utils';

type CartContextValue = {
  items: CartState['items'];
  itemCount: number;
  subtotalCents: number;
  isHydrated: boolean;
  addItem: (product: CartProduct) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const items = loadCartItems();
    dispatch({ type: 'hydrate', items });
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      saveCartItems(state.items);
    }
  }, [isHydrated, state.items]);

  const value = useMemo(
    () => ({
      items: state.items,
      itemCount: calculateItemCount(state.items),
      subtotalCents: calculateSubtotalCents(state.items),
      isHydrated,
      addItem: (product: CartProduct) => dispatch({ type: 'add', product }),
      removeItem: (productId: string) =>
        dispatch({ type: 'remove', productId }),
      updateQuantity: (productId: string, quantity: number) =>
        dispatch({ type: 'updateQuantity', productId, quantity }),
      clearCart: () => dispatch({ type: 'clear' }),
    }),
    [isHydrated, state.items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
