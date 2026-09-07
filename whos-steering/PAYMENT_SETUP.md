# Payment center deployment

The redesign preserves the existing Netlify frontend and Express/PostgreSQL backend. Do not activate live money flows until the matching backend and database migration are deployed and sandbox acceptance checks pass.

1. Apply `backend/db/migrations/2026-09-07_payment_center.sql` to the database before deploying the new backend. It adds optional PayPal fields and a durable refund request ledger. Existing Stripe records remain intact.
2. Keep `REACT_APP_API_URL`, `REACT_APP_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `JWT_SECRET`, and `FRONTEND_URL` configured on their existing hosts. The local visual preview has no production credentials.
3. Enable Klarna and supported wallets in Stripe Payment Methods. Register the production payment domain for Apple Pay / Google Pay as required by Stripe. The Payment Element only displays eligible, enabled methods. A US Stripe account cannot use Stripe-processed PayPal.
4. For direct PayPal, set `PAYPAL_ENABLED=true`, `PAYPAL_ENVIRONMENT=sandbox`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`. `FRONTEND_URL` must be the exact deployed frontend origin. Use separate sandbox buyer and business accounts; switch to live credentials and environment only after testing.
5. Configure the PayPal webhook URL as `<API origin>/api/paypal/webhook`, subscribed to `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.PENDING`, `PAYMENT.CAPTURE.DENIED`, and `PAYMENT.CAPTURE.REFUNDED`.
6. Configure Stripe's existing `<API origin>/api/checkout/webhook` for `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `refund.created`, `refund.updated`, and `refund.failed` (or the equivalent events supported by the account API version).

## Refund behavior

- Admins review a live provider balance, choose a full remaining or partial amount, select a reason, add an audit note, and confirm before submission.
- Pending refunds reserve the balance. Only completed refunds count as returned money. Partial refunds preserve fulfillment status; a completed full refund changes the order to refunded.
- Stripe retries reuse a request ID recorded in provider metadata. PayPal first records a durable reservation and uses `PayPal-Request-Id`. An uncertain PayPal request older than five hours is held for manual reconciliation rather than resubmitted after the provider's idempotency window.
- PayPal refunds issued outside the site rely on signed webhooks to populate refund history. If reconciliation is uncertain, use the PayPal dashboard and resolve the ledger before attempting another refund.
- No payout, bank-account editing, or dispute-resolution controls are added.

## Required sandbox acceptance checks

Run `node --test backend/test/payments.test.js` from this directory and build the frontend. Then validate with the actual sandbox hosts and database:

- Custom and preconfigured checkout with valid shipping information and a promo code.
- Card success, decline, 3DS, and eligible Klarna/wallet redirects on supported devices.
- PayPal approve, cancel, pending capture, and return-page refresh. Confirm the cart clears only after server verification.
- Full and partial refunds for each provider, repeated clicks/retries, pending/failed refunds, and signed webhook redelivery.
- Unauthorized refund access denied, unchanged production status after partial refunds, customer cancellation before production, and cancellation denied after production.
- Mobile navigation, configurator, checkout, admin tables, keyboard dialog focus, and reduced-motion behavior.

No real payment or refund was executed during development. Provider credential activation and database-backed acceptance remain deployment prerequisites.

References: [Stripe Payment Element](https://docs.stripe.com/payments/payment-element), [Stripe PayPal availability](https://docs.stripe.com/payments/paypal), [Stripe refunds](https://docs.stripe.com/api/refunds/create), [PayPal Orders API](https://developer.paypal.com/api/orders/v2), [PayPal refunds](https://developer.paypal.com/api/payments/v2/captures-refund).
