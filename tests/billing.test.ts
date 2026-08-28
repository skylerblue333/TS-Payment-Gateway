import {
  SKY_BILLING_CONTRACT,
  createBillingStatement,
  finalizeBillingStatement,
  voidBillingStatement,
} from '../src/billing';

describe('SkyBilling', () => {
  const input = {
    statementId: 'stmt-1',
    accountId: 'acct-1',
    currency: 'USD',
    lines: [
      { description: 'base', quantity: 2, unitAmountMinor: 1250 },
      { description: 'addon', quantity: 1, unitAmountMinor: 500 },
    ],
  };

  it('calculates deterministic integer-minor-unit totals', () => {
    const statement = createBillingStatement(input);
    expect(statement).toEqual({
      statementId: 'stmt-1', accountId: 'acct-1', currency: 'USD',
      subtotalMinor: 3000, totalMinor: 3000, status: 'draft',
    });
  });

  it('supports bounded lifecycle transitions', () => {
    const draft = createBillingStatement(input);
    const finalized = finalizeBillingStatement(draft);
    expect(finalized.status).toBe('finalized');
    expect(() => finalizeBillingStatement(finalized)).toThrow('invalid_billing_transition');
    expect(voidBillingStatement(finalized).status).toBe('void');
    expect(voidBillingStatement(voidBillingStatement(finalized)).status).toBe('void');
  });

  it('rejects invalid billing inputs', () => {
    expect(() => createBillingStatement({ ...input, currency: 'usd' })).toThrow();
    expect(() => createBillingStatement({ ...input, lines: [] })).toThrow();
    expect(() => createBillingStatement({ ...input, lines: [{ description: 'x', quantity: 0, unitAmountMinor: 1 }] })).toThrow();
  });

  it('rejects unsafe monetary overflow', () => {
    expect(() => createBillingStatement({
      ...input,
      lines: [{ description: 'overflow', quantity: 1_000_000, unitAmountMinor: 100_000_000 }],
    })).toThrow('amount_overflow');
  });

  it('publishes a no-side-effect integration contract', () => {
    expect(SKY_BILLING_CONTRACT.command).toBe('sky.billing.statement.create.v1');
    expect(SKY_BILLING_CONTRACT.externalSideEffects).toBe(false);
  });
});
