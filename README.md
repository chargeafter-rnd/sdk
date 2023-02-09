# ChargeAfter payment SDK

---

### Installing

```bash
npm install --save @chargeafter/payment-sdk
```

### Getting Started

```javascript
import { prequalify, checkout } from "@chargeafter/payment-sdk";

// open modal to obtain available credit
prequalify({
    config: {
        env: {
            name?: "production" | "sandbox", // defaults to "production"
            apiKey: "<your api key>",
        }
    },
    ...
}).then((result: CompletionApplyData)  => {
    // Fires when apply flow finished
}).catch((ex: { code: String, message: string, data: CompletionApplyData }) => {
    // Fires when apply flow finishes un-successfully
});

// open modal to perform full checkout
checkout({
    config: {
        env: {
            name?: "production" | "sandbox", // defaults to "production"
            apiKey: "<your api key>",
        }
    },
    cartDetails: ...
    ...
}).then((result: CompletionCheckoutData)  => {
    // Fires when apply flow finished
}).catch((ex: { code: String, message: string, data: CompletionCheckoutData }) => {
    // Fires when apply flow finishes un-successfully
});;
```

Check Docs for detailed callback interface for [apply](https://docs.chargeafter.com/docs/the-apply-completion-callback) and [checkout](https://docs.chargeafter.com/docs/present)
