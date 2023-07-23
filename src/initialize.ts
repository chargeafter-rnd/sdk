import { ChargeAfter, Config } from '@chargeafter/payment-types';
import { checkoutId, initScript } from './initScript';

const URLs: Record<EnvironmentType, string> = {
  production: 'https://cdn.chargeafter.com/web/v2/chargeafter.min.js',
  qa: 'https://cdn-qa.ca-dev.co/web/v2/chargeafter.min.js',
  sandbox: 'https://cdn-sandbox.ca-dev.co/web/v2/chargeafter.min.js',
  demo: 'https://cdn-demo.ca-dev.co/web/v2/chargeafter.min.js',
  develop: 'https://cdn-develop.ca-dev.co/web/v2/chargeafter.min.js',
};

export type EnvironmentType =
  | 'production'
  | 'qa'
  | 'sandbox'
  | 'demo'
  | 'develop';

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
