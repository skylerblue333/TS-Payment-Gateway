import request from 'supertest';
import { app, authorizeSandbox, resetSandbox } from '../src/index';

describe('Sky Payment Sandbox', () => {
  beforeEach(() => resetSandbox());

  it('returns health and readiness status', async () => {
    expect((await request(app).get('/healthz')).status).toBe(200);
    const ready = await request(app).get('/readyz');
    expect(ready.status).toBe(200);
    expect(ready.body.mode).toBe('sandbox');
  });

  it('creates a sandbox record without claiming money moved', () => {
    const result = authorizeSandbox({
      amountMinor: 5000,
      currency: 'USD',
      reference: 'order-123',
      idempotencyKey: 'idem-0001',
    });
    expect(result).toMatchObject({ status: 'sandbox_authorized', mode: 'sandbox', amountMinor: 5000, currency: 'USD' });
    expect(result.authorizationId).toMatch(/^sandbox_/);
  });

  it('replays the same idempotent authorization', () => {
    const input = { amountMinor: 5000, currency: 'USD', reference: 'order-123', idempotencyKey: 'idem-0001' };
    expect(authorizeSandbox(input)).toEqual(authorizeSandbox(input));
  });

  it('rejects conflicting idempotency reuse', () => {
    authorizeSandbox({ amountMinor: 5000, currency: 'USD', reference: 'order-123', idempotencyKey: 'idem-0001' });
    expect(() => authorizeSandbox({ amountMinor: 6000, currency: 'USD', reference: 'order-123', idempotencyKey: 'idem-0001' })).toThrow('idempotency_conflict');
  });

  it('rejects invalid currency and amounts', () => {
    expect(() => authorizeSandbox({ amountMinor: 0, currency: 'USD', reference: 'x', idempotencyKey: 'idem-0001' })).toThrow();
    expect(() => authorizeSandbox({ amountMinor: 10, currency: 'usd', reference: 'x', idempotencyKey: 'idem-0001' })).toThrow();
  });
});
