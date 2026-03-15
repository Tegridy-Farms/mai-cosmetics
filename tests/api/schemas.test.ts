import {
  IncomeEntrySchema,
  ExpenseEntrySchema,
  IncomeQuerySchema,
  ExpenseQuerySchema,
} from '@/lib/schemas';

describe('IncomeEntrySchema', () => {
  const validInput = {
    service_name: 'Manicure Service',
    service_type_id: 1,
    date: '2024-01-15',
    duration_minutes: 60,
    amount: 45.0,
  };

  it('accepts valid input', () => {
    expect(IncomeEntrySchema.safeParse(validInput).success).toBe(true);
  });

  it('rejects missing service_name', () => {
    const { service_name: _s, ...rest } = validInput;
    expect(IncomeEntrySchema.safeParse(rest).success).toBe(false);
  });

  it('rejects empty service_name', () => {
    expect(IncomeEntrySchema.safeParse({ ...validInput, service_name: '' }).success).toBe(false);
  });

  it('rejects missing service_type_id', () => {
    const { service_type_id: _s, ...rest } = validInput;
    expect(IncomeEntrySchema.safeParse(rest).success).toBe(false);
  });

  it('rejects zero duration_minutes', () => {
    expect(IncomeEntrySchema.safeParse({ ...validInput, duration_minutes: 0 }).success).toBe(false);
  });

  it('rejects negative duration_minutes', () => {
    expect(IncomeEntrySchema.safeParse({ ...validInput, duration_minutes: -1 }).success).toBe(false);
  });

  it('rejects non-integer duration_minutes', () => {
    expect(IncomeEntrySchema.safeParse({ ...validInput, duration_minutes: 1.5 }).success).toBe(false);
  });

  it('rejects zero amount', () => {
    expect(IncomeEntrySchema.safeParse({ ...validInput, amount: 0 }).success).toBe(false);
  });

  it('rejects negative amount', () => {
    expect(IncomeEntrySchema.safeParse({ ...validInput, amount: -5 }).success).toBe(false);
  });

  it('rejects invalid date format (MM/DD/YYYY)', () => {
    expect(IncomeEntrySchema.safeParse({ ...validInput, date: '01/15/2024' }).success).toBe(false);
  });

  it('rejects invalid date format (YYYY/MM/DD)', () => {
    expect(IncomeEntrySchema.safeParse({ ...validInput, date: '2024/01/15' }).success).toBe(false);
  });

  it('rejects non-integer service_type_id', () => {
    expect(IncomeEntrySchema.safeParse({ ...validInput, service_type_id: 1.5 }).success).toBe(false);
  });

  it('rejects zero service_type_id', () => {
    expect(IncomeEntrySchema.safeParse({ ...validInput, service_type_id: 0 }).success).toBe(false);
  });
});

describe('ExpenseEntrySchema', () => {
  const validInput = {
    description: 'Nail polish supplies',
    category: 'materials' as const,
    date: '2024-01-15',
    amount: 25.0,
  };

  it('accepts valid input with "equipment" category', () => {
    expect(ExpenseEntrySchema.safeParse({ ...validInput, category: 'equipment' }).success).toBe(true);
  });

  it('accepts valid input with "materials" category', () => {
    expect(ExpenseEntrySchema.safeParse({ ...validInput, category: 'materials' }).success).toBe(true);
  });

  it('accepts valid input with "consumables" category', () => {
    expect(ExpenseEntrySchema.safeParse({ ...validInput, category: 'consumables' }).success).toBe(true);
  });

  it('accepts valid input with "other" category', () => {
    expect(ExpenseEntrySchema.safeParse({ ...validInput, category: 'other' }).success).toBe(true);
  });

  it('rejects missing description', () => {
    const { description: _d, ...rest } = validInput;
    expect(ExpenseEntrySchema.safeParse(rest).success).toBe(false);
  });

  it('rejects empty description', () => {
    expect(ExpenseEntrySchema.safeParse({ ...validInput, description: '' }).success).toBe(false);
  });

  it('rejects invalid category ("invalid-cat")', () => {
    expect(ExpenseEntrySchema.safeParse({ ...validInput, category: 'invalid-cat' }).success).toBe(false);
  });

  it('rejects zero amount', () => {
    expect(ExpenseEntrySchema.safeParse({ ...validInput, amount: 0 }).success).toBe(false);
  });

  it('rejects negative amount', () => {
    expect(ExpenseEntrySchema.safeParse({ ...validInput, amount: -10 }).success).toBe(false);
  });

  it('rejects invalid date format', () => {
    expect(ExpenseEntrySchema.safeParse({ ...validInput, date: '2024/01/15' }).success).toBe(false);
  });
});

describe('IncomeQuerySchema', () => {
  it('coerces string page to number', () => {
    const result = IncomeQuerySchema.safeParse({ page: '3' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(typeof result.data.page).toBe('number');
    }
  });

  it('defaults page to 1 when not provided', () => {
    const result = IncomeQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
    }
  });

  it('coerces string service_type_id to number', () => {
    const result = IncomeQuerySchema.safeParse({ service_type_id: '2' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.service_type_id).toBe(2);
    }
  });

  it('accepts optional date_from in YYYY-MM-DD format', () => {
    expect(IncomeQuerySchema.safeParse({ date_from: '2024-01-01' }).success).toBe(true);
  });

  it('accepts optional date_to in YYYY-MM-DD format', () => {
    expect(IncomeQuerySchema.safeParse({ date_to: '2024-12-31' }).success).toBe(true);
  });

  it('rejects invalid date_from format', () => {
    expect(IncomeQuerySchema.safeParse({ date_from: 'not-a-date' }).success).toBe(false);
  });

  it('rejects invalid date_to format', () => {
    expect(IncomeQuerySchema.safeParse({ date_to: '12/31/2024' }).success).toBe(false);
  });
});

describe('ExpenseQuerySchema', () => {
  it('coerces string page to number', () => {
    const result = ExpenseQuerySchema.safeParse({ page: '2' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
    }
  });

  it('defaults page to 1 when not provided', () => {
    const result = ExpenseQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
    }
  });

  it('accepts valid category filter', () => {
    expect(ExpenseQuerySchema.safeParse({ category: 'equipment' }).success).toBe(true);
  });

  it('rejects invalid category filter', () => {
    expect(ExpenseQuerySchema.safeParse({ category: 'invalid' }).success).toBe(false);
  });

  it('accepts date range filters', () => {
    expect(
      ExpenseQuerySchema.safeParse({ date_from: '2024-01-01', date_to: '2024-12-31' }).success
    ).toBe(true);
  });

  it('rejects invalid date_from format', () => {
    expect(ExpenseQuerySchema.safeParse({ date_from: 'bad-date' }).success).toBe(false);
  });
});
