import request from 'supertest';
import { app, processPayment } from '../src/index';

describe('Payment Gateway', () => {
  it('processes valid payment', async () => {
    const res = await request(app).post('/charge').send({
      amount: 1000, currency: 'USD', cardToken: 'tok_visa'
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('declines card with decline token', async () => {
    const res = await request(app).post('/charge').send({
      amount: 500, currency: 'USD', cardToken: 'tok_declined'
    });
    expect(res.status).toBe(402);
    expect(res.body.status).toBe('declined');
  });

  it('rejects invalid amount', () => {
    const result = processPayment({ amount: -10, currency: 'USD', cardToken: 'tok_visa' });
    expect(result.status).toBe('error');
  });

  it('requires all fields', async () => {
    const res = await request(app).post('/charge').send({ amount: 100 });
    expect(res.status).toBe(400);
  });
});
