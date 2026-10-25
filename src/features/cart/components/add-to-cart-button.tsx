'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/features/cart/context';
import type { CartProduct } from '@/features/cart/types';

type AddToCartButtonProps = {
  product: CartProduct;
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem, isHydrated } = useCart();
  const [message, setMessage] = useState('');

  function handleAdd() {
    addItem(product);
    setMessage(`${product.name} added to your cart.`);
  }

  return (
    <div>
      <Button type="button" onClick={handleAdd} disabled={!isHydrated}>
        Add to cart
      </Button>
      <p className="sr-only" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
