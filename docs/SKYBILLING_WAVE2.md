# SkyBilling — Wave 2 slot #74

SkyBilling is a bounded engineering-beta billing domain core layered onto the existing TS Payment Gateway sandbox repository.

## Capability

- Validates billing statement/account/currency/line inputs.
- Uses integer minor units only.
- Uses checked multiplication/addition and rejects unsafe-number overflow.
- Calculates deterministic statement totals.
- Supports draft -> finalized and void lifecycle behavior.
- Publishes versioned integration identifiers `sky.billing.statement.create.v1` and `sky.billing.statement.receipt.v1`.

## SKYCOIN4444 integration boundary

Consumers may create a validated billing statement from deterministic line items and pass the resulting statement metadata to separate invoice, ledger, checkout, or payment products. `SKY_BILLING_CONTRACT.externalSideEffects` is intentionally `false`.

## Security/product limitations

This library does not authenticate accounts, calculate taxes, create legally compliant invoices, contact payment processors, collect or settle funds, perform banking or blockchain transactions, provide custody, persist data durably, verify merchants/customers, certify PCI/compliance status, or represent a production deployment.
