import express from 'express';
import { z } from 'zod';

export const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'TS-Payment-Gateway' });
});

const ChargeSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  source: z.string()
});

app.post('/api/v1/charge', (req, res) => {
  try {
    const data = ChargeSchema.parse(req.body);
    // Simulate processing
    const success = data.amount < 10000;
    res.json({
      transaction_id: `tx_${Date.now()}`,
      status: success ? 'succeeded' : 'failed',
      amount: data.amount
    });
  } catch (e) {
    res.status(400).json({ error: 'Invalid charge payload' });
  }
});


if (require.main === module) {
  app.listen(3000, () => console.log('Server running on port 3000'));
}
