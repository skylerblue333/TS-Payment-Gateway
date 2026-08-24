# Sky Payment Sandbox

**Status: engineering beta.** A focused TypeScript/Express sandbox for validating payment authorization requests and exercising idempotency behavior without contacting a payment processor or moving money.

## Implemented

- bounded integer `amountMinor` values to avoid floating-point money math
- ISO-style uppercase three-letter currency validation
- bounded business references and idempotency keys
- replay-safe in-memory idempotency for identical requests
- `409` conflict on idempotency-key reuse with changed payment data
- explicit `sandbox_authorized` / `mode: sandbox` responses
- `/healthz` and `/readyz`
- 16 KB request-body bound and disabled Express signature header
- Jest tests, TypeScript build, runtime dependency audit, non-root container packaging, and container health smoke testing

## Run

```bash
npm install
npm run build
npm test
npm start
```

Create a sandbox authorization:

```bash
curl -X POST http://127.0.0.1:3000/api/v1/sandbox/authorizations \
  -H 'content-type: application/json' \
  -d '{"amountMinor":5000,"currency":"USD","reference":"order-123","idempotencyKey":"order-123-attempt-1"}'
```

The returned ID starts with `sandbox_`. It is not a processor transaction identifier and the response does not mean funds were captured, transferred, reserved, or settled.

## SKYCOIN4444 integration

Use this service only as a development/testing boundary for marketplace or billing workflows. A real payment integration must live behind a separately verified provider adapter with webhook verification, secrets management, durable idempotency, reconciliation, refund/dispute handling, and deployment controls.

## Current limitations

State is process-local and resets on restart. This repository does not provide live processor connectivity, PCI-DSS scope handling, card/token storage, capture/refund/void operations, webhook verification, durable ledgering, fraud controls, authentication/authorization, tenant isolation, HA, or production deployment.

The repository is intentionally a small sandbox product rather than a fake production payment gateway.
