# Ecosystem Integration

**Role:** external payment-provider adapter.

**Foundation:** Stripe SDK. Payment state must be reconciled from provider events/webhooks rather than inferred solely from browser redirects.

**Consumes:** internal order/payment intents.

**Provides:** provider checkout/session identifiers and normalized payment events.

**Production requirements:** webhook signature verification, idempotency keys, currency/amount validation, audit records, secret isolation, retry-safe reconciliation, and no storage of raw payment credentials.
