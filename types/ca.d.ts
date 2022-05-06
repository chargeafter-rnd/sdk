/**
 * General flow interface
 */

import {
  ICartDetails,
  ICartItem,
  IConsumerDetails,
  IDiscount,
} from './payments';

export interface AppSettings {
  containerSelector?: string;
}

export interface IPreferences {
  /**
   * UTS LDML (https://www.unicode.org/reports/tr35/tr35.html#Identifiers).
   * Examples:
   * - en for English
   * - en-US for English as spoken in the United States
   * - en-GB for English as spoken in the United Kingdom
   * - es-AR for Spanish as spoken in Argentina
   * - ar-001 for Arabic as spoken throughout the world
   * - ar-AE for Arabic as spoken in United Arab Emirates
   */
  language?: string;
}

interface Lender {
  id: string;
  /**
   * Name of the financing lender
   */
  name: string;
}

interface AdditionalPropsToOptions {
  metadata?: unknown;
}

type GeneralErrorCode = 'MERCHANT_CONTAINER_NOT_FOUND';

type Channel = 'e_commerce' | 'in_store' | 'call_center';

export interface AppOptionsProps extends AdditionalPropsToOptions {
  appSettings?: AppSettings;
  consumerDetails?: IConsumerDetails;
  cartDetails?: ICartDetails;
  prequalifyConfirmationToken?: string;
  managed?: Managed;
  callback?: (...args: any[]) => void;
  onDataUpdate?: OnDataUpdate;
  channel?: Channel;
  preferences?: IPreferences;
  /**
   *  ISO 4217
   */
  currency?: string;
}

/**
 * Checkout flow interface
 */

interface UpdatedData {
  totalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  items: ICartItem[];
  discounts: IDiscount[];
  consumerDetails?: IConsumerDetails;
}

interface OnDataUpdateCallBackData {
  shippingAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
}

export interface CheckoutCallBackData {
  consumerDetails: IConsumerDetails;
  lender: Lender;
  totalAmount: number;
  taxAmount: number;
  shippingAmount: number;
}

export type CheckoutErrorCode =
  | 'BACK_TO_STORE'
  | 'CONSUMER_CANCELLED'
  | 'CHANGE_ADDRESS'
  | 'CREATE_CHECKOUT_FAILED'
  | 'BILLING_SHIPPING_MISMATCH'
  | 'GENERAL';

export interface CheckoutError {
  code: CheckoutErrorCode & GeneralErrorCode;
  message: string;
}

type OnDataUpdateCallBack = (data?: OnDataUpdateCallBackData) => void;

type OnDataUpdate = (
  updatedData: UpdatedData,
  callback: OnDataUpdateCallBack,
) => void;

export interface CheckoutCallBackArguments {
  /**
   * Token used for post-sale operations https://docs.chargeafter.com/reference/charges-create-new
   */
  token: string | null;
  data: CheckoutCallBackData | null;
  error: CheckoutError | null;
}

/**
 * Apply flow interface
 */
interface AvailableCredit {
  lender: Lender;
  creditAmount: string;
}

export interface ApplyCallBackData {
  /**
   * Used in Consumers API https://docs.chargeafter.com/reference/get_v1-post-sale-consumers-consumerid
   */
  consumerId: string;
  consumerDetails: IConsumerDetails;
  availableCredit: Array<AvailableCredit>;
  /**
   * Token used as prequalifyConfirmationToken in Checkout
   */
  token: string;
}

type ApplyErrorCode =
  | 'CONSUMER_CANCELLED'
  | 'CREATE_APPLICATION_FAILED'
  | 'BILLING_SHIPPING_MISMATCH'
  | 'GENERAL';

interface ApplyError {
  code: ApplyErrorCode & GeneralErrorCode;
  message: string;
}

export interface ApplyCallbackArguments {
  data: ApplyCallBackData | null;
  error: ApplyError | null;
}

/**
 * Managed flow interface
 */
export interface Managed {
  token: string;
}

export interface Fee {
  feeType: string;
  amount: number;
}

declare type Present = (opt: AppOptionsProps) => void;

export interface Flow {
  present: Present;
}

export interface Config {
  apiKey: string;
  storeId?: string;
  onLoadChargeAfter?: () => void;
  iframeId?: string;
  onLoaded?: () => void;
}

export interface ChargeAfter {
  cfg: Config;
  ui?: Flow;
  apply?: Flow;
  checkout?: Flow;
}

declare global {
  interface Window {
    ChargeAfter: ChargeAfter;
    isCAIframeScriptLoaded: boolean;
    caConfig?: unknown;
  }
}
