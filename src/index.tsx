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
  OnApprovalStatusChange,
} from '@chargeafter/payment-types';

export type {
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
  MerchantEligibilityOpt,
  OnDataUpdateCallBack,
  OnApprovalStatusChange,
  OnApprovalStatusChangeStatus,
  OnApprovalStatusChangeData,
  OrganizationDetails,
  PosType,
} from '@chargeafter/payment-types';

const checkoutId = 'chargeafter-checkout-finance-sdk';

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

export const prequalify = ({
  config,
  currency,
  consumerDetails,
  filter,
  onModalOpen,
  onConfirm,
  onApprovalStatusChange,
  posId,
  posType,
}: IPrequalifyProps) =>
  launchPaymentsUI({
    config,
    currency,
    consumerDetails,
    filter,
    onModalOpen,
    onConfirm,
    onApprovalStatusChange,
    posId,
    posType,
    checkout: false,
  }) as Promise<PrequalifyResult>;

export const checkout = ({
  config,
  currency,
  cartDetails,
  consumerDetails,
  filter,
  onDataUpdate,
  onModalOpen,
  onApprovalStatusChange,
  onConfirm,
  applicationId,
  posId,
  posType,
}: ICheckoutProps) =>
  launchPaymentsUI({
    config,
    currency,
    cartDetails,
    consumerDetails,
    filter,
    onDataUpdate,
    onModalOpen,
    onConfirm,
    onApprovalStatusChange,
    checkout: true,
    applicationId,
    posId,
    posType,
  }) as Promise<CheckoutResult>;

type LaunchPaymentsUIProps = {
  config: IConfig;
  currency?: string;
  cartDetails?: CartDetails;
  consumerDetails?: ConsumerDetails;
  filter?: Filter;
  onDataUpdate?: OnDataUpdate;
  onModalOpen?: () => void;
  onConfirm?: OnConfirm;
  onApprovalStatusChange?: OnApprovalStatusChange;
  checkout?: boolean;
  applicationId?: string;
  posId?: MerchantCheckoutOpt['posId'];
  posType?: MerchantCheckoutOpt['posType'];
  promoCode?: MerchantCheckoutOpt['promoCode'];
};

const launchPaymentsUI = ({
  config,
  consumerDetails,
  filter,
  currency,
  onConfirm,
  onApprovalStatusChange,
  posId,
  posType,
  promoCode,
  checkout,
  applicationId,
  cartDetails,
  onDataUpdate,
  onModalOpen,
}: LaunchPaymentsUIProps) => {
  return new Promise((resolve, reject) => {
    const baseOpt = {
      consumerDetails,
      channel: config.channel,
      preferences: config.preferences,
      filter: filter,
      currency,
      onConfirm: onConfirm,
      onApprovalStatusChange,
      browserSessionId: (
        config.env as IEnvironment & { browserSessionId?: string }
      ).browserSessionId,
      posId,
      posType,
      promoCode,
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
          console.info(
            `[ChargeAfterSDK]payments status: ${JSON.stringify(error)}`,
          );
          reject({ ...error, data });
        } else resolve({ token, ...data });
      },
    };

    const applyOpt: MerchantApplyOpt = {
      ...baseOpt,
      callback: (result?: CompletionApplyData, error?: CallbackStatus) => {
        if (error) {
          console.info(
            `[ChargeAfterSDK]payments status: ${JSON.stringify(error)}`,
          );
          reject({ ...error, data: result });
        } else resolve(result);
      },
    };

    const caConfig: Config & { browserSessionId?: string } = {
      apiKey: config.env.apiKey,
      delegatedMerchantId: config.env.delegatedMerchantId,
      storeId: config.storeId,
      onLoaded: onModalOpen,
    };

    initialize(caConfig, config.env.name).then((ChargeAfter) => {
      const method = checkout ? 'checkout' : 'apply';
      console.log(
        `Calling SDK for ${method}${
          checkout ? `, resume token: '${checkoutOpt.applicationId}` : ''
        }'`,
      );

      checkout
        ? ChargeAfter?.payments.present('checkout', checkoutOpt)
        : ChargeAfter?.payments.present('apply', applyOpt);
    });
  });
};

const initScript = (envUrl: string, onLoaded: () => void) => {
  const script = document.createElement('script');
  script.id = checkoutId;
  script.onload = onLoaded;
  script.src = `${envUrl}?t=${Date.now()}`;
  script.async = true;
  document.body.appendChild(script);
};

export const initialize = async (
  caConfig: Config,
  env: EnvironmentType = 'production',
): Promise<ChargeAfter> => {
  const envUrl = URLs[env];
  const { document } = window;
  if (document.getElementById(checkoutId) && window.ChargeAfter) {
    caConfig.onLoaded?.();
    return window.ChargeAfter;
  }

  window.caConfig = caConfig;
  window.ChargeAfter = {
    ...(window.ChargeAfter || ({} as ChargeAfter)),
    cfg: caConfig,
  };

  let resolveCAObject: (chargeafter: ChargeAfter) => void;
  let rejectCAObject: (error: Error) => void;

  const chargeafter = new Promise<ChargeAfter>((resolve, reject) => {
    resolveCAObject = resolve;
    rejectCAObject = reject;
  });

  const onLoadedFn = async () => {
    if (window.ChargeAfter) {
      await window.ChargeAfter?.init(caConfig);
      resolveCAObject(window.ChargeAfter);
    } else rejectCAObject(new Error('ChargeAfter not initialized'));
  };

  initScript(envUrl, onLoadedFn);

  return chargeafter;
};
