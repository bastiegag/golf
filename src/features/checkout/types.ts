export type CheckoutFieldErrors = Partial<
  Record<
    | 'customerName'
    | 'customerEmail'
    | 'shippingAddress'
    | 'shippingCity'
    | 'shippingRegion'
    | 'shippingPostalCode'
    | 'shippingCountry',
    string
  >
>;

export type CheckoutActionState =
  | {
      status: 'idle';
    }
  | {
      status: 'error';
      message: string;
      fieldErrors?: CheckoutFieldErrors;
    }
  | {
      status: 'price-changed';
      message: string;
    }
  | {
      status: 'success';
      orderNumber: string;
      confirmationToken: string;
    };

export type CheckoutQuoteState =
  | { status: 'idle' | 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'success';
      items: Array<{ productId: string; priceCents: number }>;
      totalCents: number;
    };
