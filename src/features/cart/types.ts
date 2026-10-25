export type CartProduct = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string;
};

export type CartItem = CartProduct & {
  quantity: number;
};

export type CartState = {
  items: CartItem[];
};

export type CartAction =
  | { type: 'add'; product: CartProduct }
  | { type: 'remove'; productId: string }
  | { type: 'updateQuantity'; productId: string; quantity: number }
  | { type: 'clear' }
  | { type: 'hydrate'; items: CartItem[] };
