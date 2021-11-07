# ChargeAfter payment SDK
----------

### Installing

```bash
npm install --save @chargeafter/payment-sdk
```

### Getting Started

```javascript
import { prequalify, checkout } from "@chargeafter/payment-sdk";

// open modal to obtain available credit
await prequalify({
    config: {
        env: {
            apiKey: "<your api key>",
        }
    },
    ...
});

// open modal to perform full checkout
await checkout({
    config: {
        env: {
            apiKey: "<your api key>",
        }
    },
    cartDetails: ...
    ...
});
```
