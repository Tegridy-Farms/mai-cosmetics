import { ExpenseEntrySchema } from '@/lib/schemas';

describe('ExpenseEntrySchema invoice_url', () => {
  const base = {
    description: 'Test',
    category: 'other' as const,
    date: '2025-01-15',
    amount: 10,
  };

  it('accepts missing invoice_url', () => {
    const r = ExpenseEntrySchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it('accepts valid https URL', () => {
    const r = ExpenseEntrySchema.safeParse({
      ...base,
      invoice_url: 'https://example.com/f.blob.vercel-storage.com/x',
    });
    expect(r.success).toBe(true);
  });

  it('accepts null to clear', () => {
    const r = ExpenseEntrySchema.safeParse({ ...base, invoice_url: null });
    expect(r.success).toBe(true);
  });

  it('treats empty string as null', () => {
    const r = ExpenseEntrySchema.safeParse({ ...base, invoice_url: '' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.invoice_url).toBeNull();
  });

  it('rejects invalid URL', () => {
    const r = ExpenseEntrySchema.safeParse({ ...base, invoice_url: 'not-a-url' });
    expect(r.success).toBe(false);
  });
});
