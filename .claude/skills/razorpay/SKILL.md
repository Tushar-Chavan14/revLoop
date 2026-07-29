---
name: razorpay
description: Use when integrating Razorpay payments, orders, subscriptions, refunds, or payout APIs. Use for API authentication, server-side order creation, checkout integration, webhook verification, idempotent refund behavior, and dashboard/test-mode setup. Always keep Razorpay API keys on the server and verify payment/webhook signatures before fulfilling orders.
license: MIT
metadata:
  author: razorpay
  version: "1.0.0"
  homepage: https://razorpay.com/docs/build/llm-docs
  source: https://razorpay.com/docs/llms.txt
  openclaw:
    primaryEnv: RAZORPAY_KEY_ID
    requires:
      env:
        - RAZORPAY_KEY_ID
        - RAZORPAY_KEY_SECRET
    envVars:
      - name: RAZORPAY_KEY_ID
        required: true
        description: Razorpay key ID used for API authentication
      - name: RAZORPAY_KEY_SECRET
        required: true
        description: Razorpay secret used on the server side only
      - name: RAZORPAY_WEBHOOK_SECRET
        required: false
        description: Webhook signing secret for verifying Razorpay notifications
    links:
      repository: https://github.com/razorpay
      documentation: https://razorpay.com/docs/build/llm-docs
inputs:
  - name: RAZORPAY_KEY_ID
    description: Razorpay key ID from the Dashboard in Test or Live mode.
    required: true
  - name: RAZORPAY_KEY_SECRET
    description: Razorpay secret key. Never expose this on the client.
    required: true
  - name: RAZORPAY_WEBHOOK_SECRET
    description: Webhook secret used to verify incoming Razorpay webhook payloads.
    required: false
references:
  - api.md
  - authentication.md
  - orders/create.md
  - payments/capture.md
  - webhooks.md
  - webhooks/best-practices.md
  - errors/common.md
  - security.md
---

# Razorpay

Razorpay is a payments platform. In most integrations, the intended flow is:

1. Create an Order on the server using the Orders API.
2. Use Razorpay Checkout or another supported frontend integration to collect payment.
3. Verify the payment or webhook event on the server before fulfilling the order.
4. Use webhooks for asynchronous state changes such as payment, refund, settlement, or subscription updates.

## Core Rules

- Always keep the API Secret on the server only.
- Never expose `RAZORPAY_KEY_SECRET` in browser code, mobile app code, or client-side HTML.
- Use `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from Test Mode during development and Live Mode only in production.
- Verify payment signatures and webhook signatures before trusting any event.
- Prefer server-side order creation and server-side fulfillment logic.

## Basic Integration Pattern

```ts
// Server-side only
const order = await razorpay.orders.create({
  amount: 50000,
  currency: "INR",
  receipt: "receipt_123",
  notes: {
    userId: "user_123",
  },
});
```

Then use the returned `order.id` on the client with Razorpay Checkout or the appropriate SDK.

## Webhook Verification

Verify webhook payloads using the configured webhook secret before processing events.

```ts
// Pseudocode - server-side only
const signature = req.headers["x-razorpay-signature"];
const isValid = verifySignature(req.rawBody, signature, process.env.RAZORPAY_WEBHOOK_SECRET);

if (!isValid) {
  return new Response("Invalid signature", { status: 400 });
}
```

## Common Gotchas

- Orders API should be used to create the payment intent before checkout starts.
- Payments API is used for capture and fetching payment state.
- Webhooks are the recommended way to receive async payment or payout updates reliably.
- Use idempotency for refund retries or state-changing requests where safe.
- Handle payment failure reasons and settlement or refund states explicitly in your server logic.
- Test with Razorpay Test Mode and test cards/UPI IDs before going live.

## Recommended References

- Razorpay API Documentation: https://razorpay.com/docs/build/llm-docs/api.md
- API Authentication: https://razorpay.com/docs/build/llm-docs/api/authentication.md
- Orders API: https://razorpay.com/docs/build/llm-docs/api/orders/create.md
- Payments API: https://razorpay.com/docs/build/llm-docs/api/payments/capture.md
- Webhooks: https://razorpay.com/docs/build/llm-docs/webhooks.md
- Webhooks Best Practices: https://razorpay.com/docs/build/llm-docs/webhooks/best-practices.md
- Errors: https://razorpay.com/docs/build/llm-docs/errors/common.md
- Security: https://razorpay.com/docs/build/llm-docs/security.md
