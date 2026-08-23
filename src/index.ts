import express from 'express';
import { z } from 'zod';

export const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'TS-Payment-Gateway' });
});

const ChargeSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  source: z.string().min(1),
});

export interface PaymentResult {
  transaction_id: string;
  status: 'succeeded' | 'failed';
  amount: number;
  currency: string;
}

/**
 * Local payment adapter boundary.
 * This intentionally does not move money or impersonate a live processor.
 * Replace this adapter with a verified provider integration before production.
 */
export function authorizeCharge(input: unknown): PaymentResult {
  const data = ChargeSchema.parse(input);
  return {
    transaction_id: `tx_${Date.now()}`,
    status: data.amount < 10000 ? 'succeeded' : 'failed',
    amount: data.amount,
    currency: data.currency,
  };
}

app.post('/api/v1/charge', (req, res) => {
  try {
    res.json(authorizeCharge(req.body));
  } catch {
    res.status(400).json({ error: 'Invalid charge payload' });
  }
});

if (require.main === module) {
  app.listen(3000, () => console.log('TS-Payment-Gateway listening on port 3000'));
}
