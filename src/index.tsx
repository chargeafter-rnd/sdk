import {
  CompletionCheckoutData,
  CompletionApplyData,
  MerchantApplyOpt,
  MerchantCheckoutOpt,
  MerchantIdentificationCollectionOpt,
  Config,
} from '@chargeafter/payment-types';
import {
  IConfig,
  OnDataUpdate,
  launchChargeafterUi,
} from './launchChargeafterUi';
import { initialize } from './initialize';

export type IPrequalifyProps = {
  config: IConfig;
} & MerchantApplyOpt;

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
  promoCode,
}: IPrequalifyProps) =>
  launchChargeafterUi({
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
    promoCode,
  }) as Promise<PrequalifyResult>;

export type ICheckoutProps = MerchantCheckoutOpt & {
  config: IConfig;
  onDataUpdate?: OnDataUpdate;
};

export type CheckoutResult = CompletionCheckoutData;

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
  promoCode,
}: ICheckoutProps) =>
  launchChargeafterUi({
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
    promoCode,
  }) as Promise<CheckoutResult>;

export type IdentifyOpt = {
  config: IConfig;
  opt: MerchantIdentificationCollectionOpt;
  onModalOpen?: MerchantCheckoutOpt['onModalOpen'];
};

/**
 * @description - This method is used to launch the identification modal,
 * a modal that collects the consumer's information e.g license number, expiry date, etc.
 *
 * @param {IdentifyOpt} data - the config and opt for the modal
 * @returns identification token that should be passed in the prequalify or checkout method inside opt
 */
export const identify = async ({ config, opt, onModalOpen }: IdentifyOpt) => {
  const caConfig: Config & { browserSessionId?: string } = {
    apiKey: config.env.apiKey,
    delegatedMerchantId: config.env.delegatedMerchantId,
    storeId: config.storeId,
    onLoaded: onModalOpen,
  };

  const chargeafter = await initialize(caConfig, config.env.name);

  return await chargeafter.identification.present(opt);
};

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
  MerchantIdentificationCollectionOpt,
  OnDataUpdateCallBack,
  OnApprovalStatusChange,
  OnApprovalStatusChangeStatus,
  OnApprovalStatusChangeData,
  OrganizationDetails,
  PosType,
} from '@chargeafter/payment-types';
