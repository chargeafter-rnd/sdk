import {
  ApplyCallBackData,
  AppOptionsProps,
  Channel,
  CheckoutCallBackData,
  CheckoutError,
  Config,
  IPreferences,
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
) => OnDataUpdateCallBackData | undefined;

export type IPrequalifyProps = {
  config: IConfig;
  currency?: string;
  consumerDetails?: IConsumerDetails;
  onDataUpdate?: OnDataUpdate;
};

export type ICheckoutProps = IPrequalifyProps & {
  cartDetails: ICartDetails;
  prequalifyConfirmationToken?: string;
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
  ) as Promise<PrequalifyResult>;

export const checkout = (props: ICheckoutProps) =>
  launchPaymentsUI(
    props.config,
    props.currency,
    props.cartDetails,
    props.consumerDetails,
    props.onDataUpdate,
    true,
    props.prequalifyConfirmationToken,
  ) as Promise<CheckoutResult>;

const createPaymentsUI = ({ caConfig, url, present }: CreatePaymentsData) => {
  const { document } = window;
  if (document.getElementById(checkoutId)) {
    present();
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
  checkout?: boolean,
  prequalifyConfirmationToken?: string,
) => {
  const envUrl = URLs[config.env.name ?? 'production'];

  return new Promise((resolve, reject) => {
    const opt: AppOptionsProps = {
      consumerDetails,
      cartDetails,
      prequalifyConfirmationToken,
      onDataUpdate: onDataUpdate
        ? (updatedData, callback) => {
            callback(onDataUpdate(updatedData));
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
      const method = window.ChargeAfter[checkout ? 'checkout' : 'apply'];
      console.log(
        `Calling SDK: ${method}, prequalify token: ${opt.prequalifyConfirmationToken}`,
      );
      method?.present(opt);
    };

    const caConfig = {
      apiKey: config.env.apiKey,
      storeId: config.storeId,
      onLoadChargeAfter: present,
    };

    createPaymentsUI({
      caConfig,
      url: envUrl,
      present,
    });
  });
};
