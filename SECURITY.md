# Security

This repository is a sandbox and must not receive card numbers, bank credentials, processor secrets, or other live payment credentials. It does not contact a processor or move money.

Inputs are schema validated and bounded. Amounts use integer minor units. Idempotency is process-local only and is not a durable payment guarantee. The container runs as a non-root user and CI audits runtime dependencies.

Do not expose this service as a production payment endpoint. A live integration requires provider-side authentication, webhook signature verification, durable idempotency, secrets management, reconciliation, authorization controls, audit logging, and deployment/network controls that are outside this repository's current scope.
