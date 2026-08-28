import { randomUUID } from 'crypto';
import express from 'express';
import { z } from 'zod';

export * from './billing';

export const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

const authorizations = new Map<string, SandboxAuthorization>();

app.get('/healthz', (_req, res) => {
  res.json({ status: 'healthy', service: 'sky-payment-sandbox' });
});
app.get('/readyz', (_req, res) => {
  res.json({ status: 'ready', mode: 'sandbox', retainedAuthorizations: authorizations.size });
});

const AuthorizationSchema = z.object({
  amountMinor: z.number().int().positive().max(100_000_000),
  currency: z.string().regex(/^[A-Z]{3}$/),
  reference: z.string().trim().min(1).max(120),
  idempotencyKey: z.string().trim().min(8).max(128),
}).strict();

export interface SandboxAuthorization {
  authorizationId: string;
  status: 'sandbox_authorized';
  mode: 'sandbox';
  amountMinor: number;
  currency: string;
  reference: string;
}

/**
 * Creates an in-memory sandbox authorization record.
 * No processor is contacted and no money is moved.
 */
export function authorizeSandbox(input: unknown): SandboxAuthorization {
  const data = AuthorizationSchema.parse(input);
  const existing = authorizations.get(data.idempotencyKey);
  if (existing) {
    if (
      existing.amountMinor !== data.amountMinor ||
      existing.currency !== data.currency ||
      existing.reference !== data.reference
    ) {
      throw new Error('idempotency_conflict');
    }
    return existing;
  }

  const authorization: SandboxAuthorization = {
    authorizationId: `sandbox_${randomUUID()}`,
    status: 'sandbox_authorized',
    mode: 'sandbox',
    amountMinor: data.amountMinor,
    currency: data.currency,
    reference: data.reference,
  };
  authorizations.set(data.idempotencyKey, authorization);
  return authorization;
}

export function resetSandbox(): void {
  authorizations.clear();
}

app.post('/api/v1/sandbox/authorizations', (req, res) => {
  try {
    res.status(201).json(authorizeSandbox(req.body));
  } catch (error) {
    if (error instanceof Error && error.message === 'idempotency_conflict') {
      return res.status(409).json({ error: 'idempotency key reused with different request' });
    }
    return res.status(400).json({ error: 'invalid authorization payload' });
  }
});

if (require.main === module) {
  const port = Number(process.env.PORT ?? '3000');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be 1-65535');
  app.listen(port, () => console.log(`sky-payment-sandbox listening on port ${port}`));
}
