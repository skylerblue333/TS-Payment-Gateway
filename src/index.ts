import express from 'express';

const app = express();
app.use(express.json());

interface PaymentRequest {
  amount: number;
  currency: string;
  cardToken: string;
  description?: string;
}

interface PaymentResult {
  id: string;
  status: 'success' | 'declined' | 'error';
  amount: number;
  currency: string;
  message: string;
}

function generateId(): string {
  return 'pay_' + Math.random().toString(36).substring(2, 15);
}

function processPayment(req: PaymentRequest): PaymentResult {
  if (req.amount <= 0) {
    return { id: generateId(), status: 'error', amount: req.amount, currency: req.currency, message: 'Invalid amount' };
  }
  if (req.cardToken === 'tok_declined') {
    return { id: generateId(), status: 'declined', amount: req.amount, currency: req.currency, message: 'Card declined' };
  }
  return { id: generateId(), status: 'success', amount: req.amount, currency: req.currency, message: 'Payment processed' };
}

app.post('/charge', (req, res) => {
  const payment = req.body as PaymentRequest;
  if (!payment.amount || !payment.currency || !payment.cardToken) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const result = processPayment(payment);
  const statusCode = result.status === 'success' ? 200 : result.status === 'declined' ? 402 : 400;
  return res.status(statusCode).json(result);
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

if (require.main === module) {
  app.listen(3000, () => console.log('Payment gateway on :3000'));
}

export { app, processPayment };
