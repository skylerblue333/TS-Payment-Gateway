import request from 'supertest';
import { app, authorizeCharge } from '../src/index';

describe('TS-Payment-Gateway', () => {
  it('returns health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('authorizes a valid charge through the local adapter boundary', () => {
    expect(authorizeCharge({ amount: 50, currency: 'USD', source: 'test-source' })).toMatchObject({
      status: 'succeeded',
      amount: 50,
      currency: 'USD',
    });
  });

  it('rejects invalid currency and non-positive amounts', () => {
    expect(() => authorizeCharge({ amount: 0, currency: 'USD', source: 'x' })).toThrow();
    expect(() => authorizeCharge({ amount: 10, currency: 'usd', source: 'x' })).toThrow();
  });
});
