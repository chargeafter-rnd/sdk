export interface IOnChangeData {
  name?: string;
  value?: unknown;
}

export interface IAddress {
  line1?: string;
  line2?: string;
  city?: string;
  zipCode?: string;
  state?: string;
}

export interface IConsumerDetails {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobilePhoneNumber?: string;
  shippingAddress?: IAddress;
  billingAddress?: IAddress;
}

export interface ICartItemWarranty {
  name: string;
  price: number;
  sku: string;
}

export interface ICartItem {
  name: string;
  price: number;
  sku: string;
  quantity: number;
  leasable?: boolean;
  productCategory?: string;
  warranty?: ICartItemWarranty;
}

export interface IDiscount {
  name: string;
  amount: number;
}

export interface ICartDetails {
  /**
   * Merchant order id. Passed to the lender when supported.
   */
  merchantOrderId?: string;
  items: ICartItem[];
  discounts?: IDiscount[];
  totalAmount: number;
  taxAmount: number;
  shippingAmount: number;
}

export type IPaymentError = {
  [key: string]: string | IPaymentError | undefined;
};

export interface IPaymentsErrors {
  consumerDetails?: IPaymentError;
  cartDetails?: IPaymentError;
  settings?: IPaymentError;
}

export interface IAlert {
  title: string;
  message: string;
}

export interface IPaymentsState {
  consumerDetails: IConsumerDetails;
  cartDetails: ICartDetails;
  errors: IPaymentsErrors;
  notices: INotice[];
  alert?: IAlert;
}

export interface INotice {
  type: 'error' | 'success' | 'info' | 'warning';
  notice: { message: string; code?: string };
}

export type IPaymentsReducerPayload = Partial<
  IConsumerDetails | ICartDetails | IPaymentsErrors | INotice
>;
