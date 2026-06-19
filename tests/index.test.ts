import request from 'supertest';
import { app } from '../src/index';

describe('TS-Payment-Gateway', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('should process a valid charge', async () => {
    const res = await request(app).post('/api/v1/charge').send({ amount: 50, currency: 'USD', source: 'tok_visa' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('succeeded');
  });

});
