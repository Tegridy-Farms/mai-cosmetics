/**
 * Unit tests for ExpenseEntrySchema Zod validation.
 * Pure unit tests — no database, no HTTP calls.
 */
import { ExpenseEntrySchema } from '@/lib/schemas';

const validExpense = {
  description: 'Nail polish supply',
  category: 'materials' as const,
  date: '2026-03-15',
  amount: 120.0,
};

describe('ExpenseEntrySchema', () => {
  describe('valid inputs', () => {
    it('accepts a fully valid expense entry', () => {
      const result = ExpenseEntrySchema.safeParse(validExpense);
      expect(result.success).toBe(true);
    });

    it('accepts category "equipment"', () => {
      const result = ExpenseEntrySchema.safeParse({ ...validExpense, category: 'equipment' });
      expect(result.success).toBe(true);
    });

    it('accepts category "consumables"', () => {
      const result = ExpenseEntrySchema.safeParse({ ...validExpense, category: 'consumables' });
      expect(result.success).toBe(true);
    });

    it('accepts category "other"', () => {
      const result = ExpenseEntrySchema.safeParse({ ...validExpense, category: 'other' });
      expect(result.success).toBe(true);
    });

    it('accepts minimum valid amount above zero', () => {
      const result = ExpenseEntrySchema.safeParse({ ...validExpense, amount: 0.01 });
      expect(result.success).toBe(true);
    });
  });

  describe('description validation', () => {
    it('rejects missing description', () => {
      const { description: _, ...rest } = validExpense;
      const result = ExpenseEntrySchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('rejects empty string description', () => {
      const result = ExpenseEntrySchema.safeParse({ ...validExpense, description: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('category validation', () => {
    it('rejects missing category', () => {
      const { category: _, ...rest } = validExpense;
      const result = ExpenseEntrySchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('rejects invalid category "invalid"', () => {
      const result = ExpenseEntrySchema.safeParse({ ...validExpense, category: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('rejects category "tools" (not in enum)', () => {
      const result = ExpenseEntrySchema.safeParse({ ...validExpense, category: 'tools' });
      expect(result.success).toBe(false);
    });

    it('rejects category "EQUIPMENT" (case-sensitive)', () => {
      const result = ExpenseEntrySchema.safeParse({ ...validExpense, category: 'EQUIPMENT' });
      expect(result.success).toBe(false);
    });

    it('rejects empty string category', () => {
      const result = ExpenseEntrySchema.safeParse({ ...validExpense, category: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('date validation', () => {
    it('rejects missing date', () => {
      const { date: _, ...rest } = validExpense;
      const result = ExpenseEntrySchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('rejects date with invalid format (plain text)', () => {
      const result = ExpenseEntrySchema.safeParse({ ...validExpense, date: 'not-a-date' });
      expect(result.success).toBe(false);
    });

    it('rejects date in MM/DD/YYYY format', () => {
      const result = ExpenseEntrySchema.safeParse({ ...validExpense, date: '03/15/2026' });
      expect(result.success).toBe(false);
    });
  });

  describe('amount validation', () => {
    it('rejects missing amount', () => {
      const { amount: _, ...rest } = validExpense;
      const result = ExpenseEntrySchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('rejects amount of 0', () => {
      const result = ExpenseEntrySchema.safeParse({ ...validExpense, amount: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects negative amount', () => {
      const result = ExpenseEntrySchema.safeParse({ ...validExpense, amount: -1 });
      expect(result.success).toBe(false);
    });

    it('rejects amount of -0.01', () => {
      const result = ExpenseEntrySchema.safeParse({ ...validExpense, amount: -0.01 });
      expect(result.success).toBe(false);
    });
  });

  describe('error details', () => {
    it('returns error details for invalid input', () => {
      const result = ExpenseEntrySchema.safeParse({ ...validExpense, amount: 0 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('returns multiple errors for multiple invalid fields', () => {
      const result = ExpenseEntrySchema.safeParse({
        description: '',
        category: 'invalid',
        date: 'bad',
        amount: -5,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
      }
    });
  });
});
