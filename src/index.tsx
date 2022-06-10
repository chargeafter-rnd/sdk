import {
  ApplyCallBackData,
  AppOptionsProps,
  Channel,
  CheckoutCallBackData,
  CheckoutError,
  Config,
  IPreferences,
  OnConfirm,
  OnDataUpdateCallBackData,
  UpdatedData,
} from '../types/ca';
import { ICartDetails, IConsumerDetails } from '../types/payments';

const checkoutId = 'chargeafter-checkout-finance-sdk';

interface CreatePaymentsData {
  caConfig: Config;
  url: string;
  present: () => void;
}

export type EnvironmentType =
  | 'production'
  | 'qa'
  | 'sandbox'
  | 'demo'
  | 'develop';

export type IEnvironment = {
  name?: EnvironmentType;
  apiKey: string;
  delegatedMerchantId?: string;
};

const URLs: Record<EnvironmentType, string> = {
  production: 'https://cdn.chargeafter.com/web/v2/chargeafter.min.js',
  qa: 'https://cdn-qa.ca-dev.co/web/v2/chargeafter.min.js',
  sandbox: 'https://cdn-sandbox.ca-dev.co/web/v2/chargeafter.min.js',
  demo: 'https://cdn-demo.ca-dev.co/web/v2/chargeafter.min.js',
  develop: 'https://cdn-develop.ca-dev.co/web/v2/chargeafter.min.js',
};

export type IConfig = {
  env: IEnvironment;
  channel?: Channel;
  storeId?: string;
  preferences?: IPreferences;
};

export type OnDataUpdate = (
  data: UpdatedData,
) => PromiseLike<OnDataUpdateCallBackData> | undefined | void;

export type IPrequalifyProps = {
  config: IConfig;
  /**
   *  ISO 4217
   */
  currency?: string;
  consumerDetails?: IConsumerDetails;
  /**
   * Invoked on data updates during prequalification process
   */
  onDataUpdate?: OnDataUpdate;
  /**
   * Fires just before the modal dialog is displayed. Used to hide loading indicators
   */
  onModalOpen?: () => void;
  /**
   * Fires when the user confirms the loan and confirmation token is created
   */
  onConfirm?: OnConfirm;
};

export type ICheckoutProps = IPrequalifyProps & {
  cartDetails: ICartDetails;
  /**
   * Confirmation token received after `prequalify()`. Will continue prequalification to the checkout.
   * The cart's total amount must be <= to the prequalified amount
   */
  applicationId?: string;
};

export type CheckoutResult = CheckoutCallBackData & { token: string };
export type PrequalifyResult = ApplyCallBackData;

export const prequalify = (props: IPrequalifyProps) =>
  launchPaymentsUI(
    props.config,
    props.currency,
    undefined,
    props.consumerDetails,
    props.onDataUpdate,
    props.onModalOpen,
    props.onConfirm,
  ) as Promise<PrequalifyResult>;

export const checkout = (props: ICheckoutProps) =>
  launchPaymentsUI(
    props.config,
    props.currency,
    props.cartDetails,
    props.consumerDetails,
    props.onDataUpdate,
    props.onModalOpen,
    props.onConfirm,
    true,
    props.applicationId,
  ) as Promise<CheckoutResult>;

const createPaymentsUI = ({ caConfig, url, present }: CreatePaymentsData) => {
  const { document } = window;
  if (document.getElementById(checkoutId)) {
    present();
    caConfig.onLoaded?.();
    return;
  }
  window.caConfig = caConfig;
  window.ChargeAfter = { ...(window.ChargeAfter || {}), cfg: caConfig };
  const script = document.createElement('script');
  script.id = checkoutId;
  script.onload = present;
  script.src = url;
  script.async = true;
  document.body.appendChild(script);
};

const launchPaymentsUI = (
  config: IConfig,
  currency?: string,
  cartDetails?: ICartDetails,
  consumerDetails?: IConsumerDetails,
  onDataUpdate?: OnDataUpdate,
  onModalOpen?: () => void,
  onConfirm?: OnConfirm,
  checkout?: boolean,
  applicationId?: string,
) => {
  const envUrl = URLs[config.env.name ?? 'production'];

  return new Promise((resolve, reject) => {
    const opt: AppOptionsProps = {
      consumerDetails,
      cartDetails,
      applicationId,
      onConfirm: onConfirm,
      onDataUpdate: onDataUpdate
        ? (updatedData, callback) => {
            const result = onDataUpdate(updatedData);
            if (result) result.then((data) => callback(data));
            else callback();
          }
        : undefined,
      callback: checkout
        ? (
            token?: string,
            data?: CheckoutCallBackData,
            error?: CheckoutError,
          ) => {
            if (error) {
              console.error(`payments error: ${JSON.stringify(error)}`);
              reject(error);
            } else resolve({ token, ...data });
          }
        : (result?: ApplyCallBackData, error?: CheckoutError) => {
            if (error) {
              console.error(`payments error: ${JSON.stringify(error)}`);
              reject(error);
            } else resolve(result);
          },
      channel: config.channel,
      preferences: config.preferences,
      currency,
    };

    const present = () => {
      const method = checkout ? 'checkout' : 'apply';
      console.log(
        `Calling SDK for ${method}, resume token: '${opt.applicationId}'`,
      );
      window.ChargeAfter[method]?.present(opt);
    };

    const caConfig: Config = {
      apiKey: config.env.apiKey,
      delegatedMerchantId: config.env.delegatedMerchantId,
      storeId: config.storeId,
      onLoadChargeAfter: present,
      onLoaded: onModalOpen,
    };

    createPaymentsUI({
      caConfig,
      url: envUrl,
      present,
    });
  });
};
