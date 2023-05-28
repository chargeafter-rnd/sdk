import { ChargeAfter, Config } from '@chargeafter/payment-types';
import '@types/jest';
declare global {
  interface Window {
    ChargeAfter: ChargeAfter;
    caConfig: Config;
  }
}
