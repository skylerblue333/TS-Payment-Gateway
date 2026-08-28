import { z } from 'zod';

const BillingLineSchema = z.object({
  description: z.string().trim().min(1).max(160),
  quantity: z.number().int().positive().max(1_000_000),
  unitAmountMinor: z.number().int().nonnegative().max(100_000_000),
}).strict();

export const BillingStatementSchema = z.object({
  statementId: z.string().trim().min(1).max(120),
  accountId: z.string().trim().min(1).max(120),
  currency: z.string().regex(/^[A-Z]{3}$/),
  lines: z.array(BillingLineSchema).min(1).max(1000),
}).strict();

export type BillingStatementInput = z.infer<typeof BillingStatementSchema>;

export interface BillingStatement {
  statementId: string;
  accountId: string;
  currency: string;
  subtotalMinor: number;
  totalMinor: number;
  status: 'draft' | 'finalized' | 'void';
}

const MAX_BILLING_AMOUNT_MINOR = 9_999_999_999_999;

function checkedAdd(left: number, right: number): number {
  const value = left + right;
  if (!Number.isSafeInteger(value) || value > MAX_BILLING_AMOUNT_MINOR) {
    throw new Error('amount_overflow');
  }
  return value;
}

function checkedMultiply(left: number, right: number): number {
  const value = left * right;
  if (!Number.isSafeInteger(value) || value > MAX_BILLING_AMOUNT_MINOR) {
    throw new Error('amount_overflow');
  }
  return value;
}

/**
 * Deterministically calculates a billing statement in integer minor units.
 * This is a domain-core calculation only; it does not charge, settle, invoice,
 * collect tax, contact a payment processor, or move funds.
 */
export function createBillingStatement(input: unknown): BillingStatement {
  const data = BillingStatementSchema.parse(input);
  let subtotalMinor = 0;
  for (const line of data.lines) {
    subtotalMinor = checkedAdd(subtotalMinor, checkedMultiply(line.quantity, line.unitAmountMinor));
  }

  return {
    statementId: data.statementId,
    accountId: data.accountId,
    currency: data.currency,
    subtotalMinor,
    totalMinor: subtotalMinor,
    status: 'draft',
  };
}

export function finalizeBillingStatement(statement: BillingStatement): BillingStatement {
  if (statement.status !== 'draft') throw new Error('invalid_billing_transition');
  return { ...statement, status: 'finalized' };
}

export function voidBillingStatement(statement: BillingStatement): BillingStatement {
  if (statement.status === 'void') return statement;
  return { ...statement, status: 'void' };
}

export const SKY_BILLING_CONTRACT = {
  command: 'sky.billing.statement.create.v1',
  receipt: 'sky.billing.statement.receipt.v1',
  monetaryUnit: 'integer_minor_units',
  externalSideEffects: false,
} as const;
