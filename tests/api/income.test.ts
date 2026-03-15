/**
 * Unit tests for IncomeEntrySchema Zod validation.
 * Pure unit tests — no database, no HTTP calls.
 */
import { IncomeEntrySchema } from '@/lib/schemas';

const validIncome = {
  service_name: 'Classic Manicure',
  service_type_id: 1,
  date: '2026-03-15',
  duration_minutes: 60,
  amount: 45.0,
};

describe('IncomeEntrySchema', () => {
  describe('valid inputs', () => {
    it('accepts a fully valid income entry', () => {
      const result = IncomeEntrySchema.safeParse(validIncome);
      expect(result.success).toBe(true);
    });

    it('accepts minimum valid duration of 1 minute', () => {
      const result = IncomeEntrySchema.safeParse({ ...validIncome, duration_minutes: 1 });
      expect(result.success).toBe(true);
    });

    it('accepts minimum valid amount above zero', () => {
      const result = IncomeEntrySchema.safeParse({ ...validIncome, amount: 0.01 });
      expect(result.success).toBe(true);
    });
  });

  describe('service_name validation', () => {
    it('rejects missing service_name', () => {
      const { service_name: _, ...rest } = validIncome;
      const result = IncomeEntrySchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('rejects empty string service_name', () => {
      const result = IncomeEntrySchema.safeParse({ ...validIncome, service_name: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('service_type_id validation', () => {
    it('rejects missing service_type_id', () => {
      const { service_type_id: _, ...rest } = validIncome;
      const result = IncomeEntrySchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('rejects service_type_id of 0', () => {
      const result = IncomeEntrySchema.safeParse({ ...validIncome, service_type_id: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects negative service_type_id', () => {
      const result = IncomeEntrySchema.safeParse({ ...validIncome, service_type_id: -1 });
      expect(result.success).toBe(false);
    });

    it('rejects non-integer service_type_id', () => {
      const result = IncomeEntrySchema.safeParse({ ...validIncome, service_type_id: 1.5 });
      expect(result.success).toBe(false);
    });
  });

  describe('date validation', () => {
    it('rejects missing date', () => {
      const { date: _, ...rest } = validIncome;
      const result = IncomeEntrySchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('rejects date with invalid format (text string)', () => {
      const result = IncomeEntrySchema.safeParse({ ...validIncome, date: 'not-a-date' });
      expect(result.success).toBe(false);
    });

    it('rejects date in MM/DD/YYYY format', () => {
      const result = IncomeEntrySchema.safeParse({ ...validIncome, date: '03/15/2026' });
      expect(result.success).toBe(false);
    });
  });

  describe('duration_minutes validation', () => {
    it('rejects missing duration_minutes', () => {
      const { duration_minutes: _, ...rest } = validIncome;
      const result = IncomeEntrySchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('rejects duration_minutes of 0', () => {
      const result = IncomeEntrySchema.safeParse({ ...validIncome, duration_minutes: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects negative duration_minutes', () => {
      const result = IncomeEntrySchema.safeParse({ ...validIncome, duration_minutes: -30 });
      expect(result.success).toBe(false);
    });

    it('rejects non-integer duration_minutes', () => {
      const result = IncomeEntrySchema.safeParse({ ...validIncome, duration_minutes: 30.5 });
      expect(result.success).toBe(false);
    });
  });

  describe('amount validation', () => {
    it('rejects missing amount', () => {
      const { amount: _, ...rest } = validIncome;
      const result = IncomeEntrySchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('rejects amount of 0', () => {
      const result = IncomeEntrySchema.safeParse({ ...validIncome, amount: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects negative amount', () => {
      const result = IncomeEntrySchema.safeParse({ ...validIncome, amount: -0.01 });
      expect(result.success).toBe(false);
    });

    it('rejects amount of -100', () => {
      const result = IncomeEntrySchema.safeParse({ ...validIncome, amount: -100 });
      expect(result.success).toBe(false);
    });
  });

  describe('error details', () => {
    it('returns error details for invalid input', () => {
      const result = IncomeEntrySchema.safeParse({ ...validIncome, amount: 0 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('returns multiple errors for multiple invalid fields', () => {
      const result = IncomeEntrySchema.safeParse({
        service_name: '',
        service_type_id: -1,
        date: 'bad',
        duration_minutes: 0,
        amount: -5,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
      }
    });
  });
});
