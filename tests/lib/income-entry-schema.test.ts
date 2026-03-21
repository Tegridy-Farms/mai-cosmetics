import { AddonCreateSchema, IncomeEntrySchema } from '@/lib/schemas';

describe('IncomeEntrySchema applied_addon_ids', () => {
  const base = {
    service_name: 'Gel',
    service_type_id: 1,
    date: '2025-01-15',
    duration_minutes: 60,
    amount: 120,
    comment: null as string | null,
  };

  it('defaults missing applied_addon_ids to empty array', () => {
    const r = IncomeEntrySchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.applied_addon_ids).toEqual([]);
  });

  it('accepts applied_addon_ids with duplicates for quantity', () => {
    const r = IncomeEntrySchema.safeParse({
      ...base,
      applied_addon_ids: [2, 2, 3],
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.applied_addon_ids).toEqual([2, 2, 3]);
  });

  it('treats null applied_addon_ids as empty', () => {
    const r = IncomeEntrySchema.safeParse({ ...base, applied_addon_ids: null });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.applied_addon_ids).toEqual([]);
  });
});

describe('AddonCreateSchema', () => {
  it('accepts empty service_type_ids', () => {
    const r = AddonCreateSchema.safeParse({ name: 'French', price: 25, service_type_ids: [] });
    expect(r.success).toBe(true);
  });

  it('accepts linked service types', () => {
    const r = AddonCreateSchema.safeParse({
      name: 'French',
      price: 25,
      service_type_ids: [1, 2],
    });
    expect(r.success).toBe(true);
  });
});
