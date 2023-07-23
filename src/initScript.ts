export const checkoutId = 'chargeafter-checkout-finance-sdk';

export const initScript = (envUrl: string, onLoaded: () => void) => {
  const script = document.createElement('script');
  script.id = checkoutId;
  script.onload = onLoaded;
  script.src = `${envUrl}?t=${Date.now()}`;
  script.async = true;
  document.body.appendChild(script);
};
