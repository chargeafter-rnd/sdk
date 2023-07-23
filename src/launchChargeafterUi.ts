import {
  CartDetails,
  Channel,
  ConsumerDetails,
  ConsumerPreferences,
  Filter,
  MerchantCheckoutOpt,
  OnApprovalStatusChange,
  OnConfirm,
  OnDataUpdateCallBackData,
  UpdatedData,
  CompletionCheckoutData,
  CallbackStatus,
  MerchantApplyOpt,
  CompletionApplyData,
  Config,
} from '@chargeafter/payment-types';
import { EnvironmentType, initialize } from './initialize';

export type IEnvironment = {
  name?: EnvironmentType;
  apiKey: string;
  delegatedMerchantId?: string;
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

export const launchChargeafterUi = ({
  config,
  consumerDetails,
  filter,
  currency,
  onConfirm,
  onApprovalStatusChange,
  posId,
  posType,
  checkout,
  applicationId,
  cartDetails,
  onDataUpdate,
  onModalOpen,
  promoCode,
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
