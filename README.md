# TS-Payment-Gateway

Stripe-style payment processing API with charge, decline, and error handling.

## Quick Start

```bash
npm ci && npm test
```

## API

`POST /charge` — `{ amount, currency, cardToken }`  
Returns `{ id, status, amount, currency, message }`
