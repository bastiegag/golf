'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCart } from '@/features/cart/context';
import { MAX_CART_QUANTITY } from '@/features/cart/constants';
import type { CartProduct } from '@/features/cart/types';

type AddToCartButtonProps = {
  product: CartProduct;
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem, isHydrated, items } = useCart();
  const currentQuantity =
    items.find((item) => item.productId === product.productId)?.quantity ?? 0;
  const atMaximum = currentQuantity >= MAX_CART_QUANTITY;

  function handleAdd() {
    if (atMaximum) {
      toast.warning(
        `${product.name} is already at the maximum quantity of ${MAX_CART_QUANTITY}.`,
      );
      return;
    }

    addItem(product);
    toast.success(`${product.name} added to your cart.`);
  }

  return (
    <div>
      <Button
        type="button"
        onClick={handleAdd}
        disabled={!isHydrated || atMaximum}
      >
        {atMaximum ? 'Maximum quantity reached' : 'Add to cart'}
      </Button>
    </div>
  );
}
