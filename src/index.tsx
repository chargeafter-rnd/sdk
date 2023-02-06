import {
  Channel,
  Config,
  OnConfirm,
  CartDetails,
  CompletionCheckoutData,
  CompletionApplyData,
  ConsumerDetails,
  OnDataUpdateCallBackData,
  CallbackStatus,
  UpdatedData,
  ConsumerPreferences,
  MerchantApplyOpt,
  MerchantCheckoutOpt,
  ChargeAfter,
  Filter,
} from '@chargeafter/payment-types';

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
  preferences?: ConsumerPreferences;
};

export type OnDataUpdate = (
  data: UpdatedData,
) => PromiseLike<OnDataUpdateCallBackData> | undefined | void;

export type IPrequalifyProps = {
  config: IConfig;
} & MerchantApplyOpt;

export type ICheckoutProps = MerchantCheckoutOpt & {
  config: IConfig;
  onDataUpdate?: OnDataUpdate;
};

export type CheckoutResult = CompletionCheckoutData;
export type PrequalifyResult = CompletionApplyData;

export const prequalify = (props: IPrequalifyProps) =>
  launchPaymentsUI(
    props.config,
    props.currency,
    undefined,
    props.consumerDetails,
    props.filter,
    undefined,
    props.onModalOpen,
    props.onConfirm,
  ) as Promise<PrequalifyResult>;

export const checkout = (props: ICheckoutProps) =>
  launchPaymentsUI(
    props.config,
    props.currency,
    props.cartDetails,
    props.consumerDetails,
    props.filter,
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
  window.ChargeAfter = {
    ...(window.ChargeAfter || ({} as ChargeAfter)),
    cfg: caConfig,
  };
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
  cartDetails?: CartDetails,
  consumerDetails?: ConsumerDetails,
  filter?: Filter,
  onDataUpdate?: OnDataUpdate,
  onModalOpen?: () => void,
  onConfirm?: OnConfirm,
  checkout?: boolean,
  applicationId?: string,
) => {
  const envUrl = URLs[config.env.name ?? 'production'];
  return new Promise((resolve, reject) => {
    const baseOpt = {
      consumerDetails,
      channel: config.channel,
      preferences: config.preferences,
      filter: filter,
      currency,
      onConfirm: onConfirm,
      browserSessionId: (
        config.env as IEnvironment & { browserSessionId?: string }
      ).browserSessionId,
    };

    const checkoutOpt: MerchantCheckoutOpt = {
      ...baseOpt,
      cartDetails: cartDetails as CartDetails,
      applicationId,
      onDataUpdate: onDataUpdate
        ? (updatedData, callback) => {
            const result = onDataUpdate(updatedData);
            if (result) result.then((data) => callback(data));
            else callback({});
          }
        : undefined,
      callback: (
        token?: string,
        data?: CompletionCheckoutData,
        error?: CallbackStatus,
      ) => {
        if (error) {
          console.error(`payments error: ${JSON.stringify(error)}`);
          reject(error);
        } else resolve({ token, ...data });
      },
    };

    const applyOpt: MerchantApplyOpt = {
      ...baseOpt,
      callback: (result?: CompletionApplyData, error?: CallbackStatus) => {
        if (error) {
          console.error(`payments error: ${JSON.stringify(error)}`);
          reject(error);
        } else resolve(result);
      },
    };

    const present = () => {
      const method = checkout ? 'checkout' : 'apply';
      console.log(
        `Calling SDK for ${method}${
          checkout ? `, resume token: '${checkoutOpt.applicationId}` : ''
        }'`,
      );

      checkout
        ? window.ChargeAfter?.checkout.present(checkoutOpt)
        : window.ChargeAfter?.apply.present(applyOpt);
    };

    const caConfig: Config & { browserSessionId?: string } = {
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
