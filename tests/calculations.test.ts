/**
 * Unit tests for net_per_hour and per-service-type calculation formulas.
 * Pure math tests — no database, no imports from src/lib/db.
 */

// Known test dataset:
// - Manicure:  5 sessions × 50 min × $40 = $200 gross, 250 min
// - Pedicure:  3 sessions × 60 min × $55 = $165 gross, 180 min
// - Gel Nails: 2 sessions × 90 min × $80 = $160 gross, 180 min
// Total gross: $525, total duration: 610 min
// Expenses: $100 + $50 = $150
// Net income: $525 - $150 = $375
// Net per hour: $375 / (610/60) = $375 / 10.1̄6̄ ≈ $36.88

interface ServiceTypeInput {
  name: string;
  gross_income: number;
  total_minutes: number;
  total_sessions: number;
}

interface ExpenseInput {
  amount: number;
}

// ---------- Pure formula implementations (mirrors src/lib/calculations.ts logic) ----------

function calcNetPerHour(grossIncome: number, totalExpenses: number, totalMinutes: number): number {
  const netIncome = grossIncome - totalExpenses;
  if (totalMinutes <= 0) return 0;
  return netIncome / (totalMinutes / 60);
}

function calcServiceTypeMetrics(
  serviceTypes: ServiceTypeInput[],
  expenses: ExpenseInput[]
): Array<{
  name: string;
  gross_income: number;
  expense_share: number;
  net_income: number;
  total_hours: number;
  total_sessions: number;
}> {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const grandGross = serviceTypes.reduce((sum, s) => sum + s.gross_income, 0);

  return serviceTypes.map((s) => {
    const expense_share =
      grandGross > 0 ? totalExpenses * (s.gross_income / grandGross) : 0;
    return {
      name: s.name,
      gross_income: s.gross_income,
      expense_share,
      net_income: s.gross_income - expense_share,
      total_hours: s.total_minutes / 60,
      total_sessions: s.total_sessions,
    };
  });
}

// ---------- Dataset ----------

const serviceTypes: ServiceTypeInput[] = [
  { name: 'Manicure',  gross_income: 200, total_minutes: 250, total_sessions: 5 },
  { name: 'Pedicure',  gross_income: 165, total_minutes: 180, total_sessions: 3 },
  { name: 'Gel Nails', gross_income: 160, total_minutes: 180, total_sessions: 2 },
];

const expenses: ExpenseInput[] = [
  { amount: 100 },
  { amount: 50 },
];

const TOTAL_GROSS = 525;
const TOTAL_MINUTES = 610;
const TOTAL_EXPENSES = 150;
const NET_INCOME = TOTAL_GROSS - TOTAL_EXPENSES; // $375

// ---------- net_per_hour tests ----------

describe('net_per_hour formula', () => {
  it('calculates net per hour correctly for known dataset', () => {
    const result = calcNetPerHour(TOTAL_GROSS, TOTAL_EXPENSES, TOTAL_MINUTES);
    // $375 / (610/60) = $375 / 10.1666... ≈ $36.885...
    const expected = NET_INCOME / (TOTAL_MINUTES / 60);
    expect(result).toBeCloseTo(expected, 2);
  });

  it('is approximately $36.89 per hour', () => {
    const result = calcNetPerHour(TOTAL_GROSS, TOTAL_EXPENSES, TOTAL_MINUTES);
    // 375 / (610/60) = 375 / 10.1̄6̄ ≈ 36.885
    expect(result).toBeCloseTo(36.89, 1);
  });

  it('returns 0 when total_minutes is 0', () => {
    expect(calcNetPerHour(500, 100, 0)).toBe(0);
  });

  it('returns negative net_per_hour when expenses exceed gross', () => {
    const result = calcNetPerHour(100, 200, 120); // net = -100, hours = 2
    expect(result).toBeCloseTo(-50, 2);
  });

  it('returns 0 when gross is 0 and expenses are 0', () => {
    expect(calcNetPerHour(0, 0, 0)).toBe(0);
  });
});

// ---------- per-service-type expense_share and net_income tests ----------

describe('per-service-type calculations', () => {
  let metrics: ReturnType<typeof calcServiceTypeMetrics>;

  beforeEach(() => {
    metrics = calcServiceTypeMetrics(serviceTypes, expenses);
  });

  // Manicure: expense_share = 150 * (200/525) = 57.142857...
  it('calculates Manicure expense_share within ±$0.01', () => {
    const manicure = metrics.find((m) => m.name === 'Manicure')!;
    expect(manicure.expense_share).toBeCloseTo(57.14, 2);
  });

  it('calculates Manicure net_income within ±$0.01', () => {
    const manicure = metrics.find((m) => m.name === 'Manicure')!;
    expect(manicure.net_income).toBeCloseTo(142.86, 2);
  });

  // Pedicure: expense_share = 150 * (165/525) = 47.142857...
  it('calculates Pedicure expense_share within ±$0.01', () => {
    const pedicure = metrics.find((m) => m.name === 'Pedicure')!;
    expect(pedicure.expense_share).toBeCloseTo(47.14, 2);
  });

  it('calculates Pedicure net_income within ±$0.01', () => {
    const pedicure = metrics.find((m) => m.name === 'Pedicure')!;
    expect(pedicure.net_income).toBeCloseTo(117.86, 2);
  });

  // Gel Nails: expense_share = 150 * (160/525) = 45.714285...
  it('calculates Gel Nails expense_share within ±$0.01', () => {
    const gel = metrics.find((m) => m.name === 'Gel Nails')!;
    expect(gel.expense_share).toBeCloseTo(45.71, 2);
  });

  it('calculates Gel Nails net_income within ±$0.01', () => {
    const gel = metrics.find((m) => m.name === 'Gel Nails')!;
    expect(gel.net_income).toBeCloseTo(114.29, 2);
  });

  it('sum of expense_shares equals total expenses within ±$0.01', () => {
    const totalShare = metrics.reduce((sum, m) => sum + m.expense_share, 0);
    expect(totalShare).toBeCloseTo(TOTAL_EXPENSES, 2);
  });

  it('sum of net_incomes equals total net_income within ±$0.01', () => {
    const totalNet = metrics.reduce((sum, m) => sum + m.net_income, 0);
    expect(totalNet).toBeCloseTo(NET_INCOME, 2);
  });

  it('returns expense_share of 0 when grand gross is 0', () => {
    const result = calcServiceTypeMetrics(
      [{ name: 'A', gross_income: 0, total_minutes: 60, total_sessions: 1 }],
      [{ amount: 100 }]
    );
    expect(result[0].expense_share).toBe(0);
  });

  it('computes total_hours correctly', () => {
    const manicure = metrics.find((m) => m.name === 'Manicure')!;
    expect(manicure.total_hours).toBeCloseTo(250 / 60, 4);
  });

  it('preserves total_sessions', () => {
    const pedicure = metrics.find((m) => m.name === 'Pedicure')!;
    expect(pedicure.total_sessions).toBe(3);
  });
});
