import { getDashboardMetrics, getServiceTypeMetrics, getTrendData } from '@/lib/calculations';
import { sql } from '@/lib/db';

jest.mock('@/lib/db', () => ({
  sql: jest.fn(),
  query: jest.fn(),
}));

const mockSql = sql as unknown as jest.Mock;

beforeEach(() => {
  mockSql.mockReset();
});

describe('getDashboardMetrics', () => {
  it('returns correct arithmetic for period=all (net_per_hour = 40)', async () => {
    // gross=100, minutes=120, expenses=20 → net=80, net_per_hour=80/(120/60)=40
    mockSql
      .mockResolvedValueOnce({ rows: [{ gross_income: '100.00', total_minutes: '120' }] })
      .mockResolvedValueOnce({ rows: [{ total_expenses: '20.00' }] });

    const result = await getDashboardMetrics('all');

    expect(result.gross_income).toBe(100);
    expect(result.total_expenses).toBe(20);
    expect(result.net_income).toBe(80);
    expect(result.net_per_hour).toBeCloseTo(40, 2);
  });

  it('returns correct arithmetic for period=month', async () => {
    // gross=200, minutes=240, expenses=50 → net=150, net_per_hour=150/(240/60)=37.5
    mockSql
      .mockResolvedValueOnce({ rows: [{ gross_income: '200.00', total_minutes: '240' }] })
      .mockResolvedValueOnce({ rows: [{ total_expenses: '50.00' }] });

    const result = await getDashboardMetrics('month');

    expect(result.gross_income).toBe(200);
    expect(result.total_expenses).toBe(50);
    expect(result.net_income).toBe(150);
    expect(result.net_per_hour).toBeCloseTo(37.5, 2);
  });

  it('returns 0 for net_per_hour when total_minutes is 0', async () => {
    mockSql
      .mockResolvedValueOnce({ rows: [{ gross_income: '100.00', total_minutes: '0' }] })
      .mockResolvedValueOnce({ rows: [{ total_expenses: '20.00' }] });

    const result = await getDashboardMetrics('all');

    expect(result.net_per_hour).toBe(0);
  });

  it('returns the expected shape', async () => {
    mockSql
      .mockResolvedValueOnce({ rows: [{ gross_income: '0', total_minutes: '0' }] })
      .mockResolvedValueOnce({ rows: [{ total_expenses: '0' }] });

    const result = await getDashboardMetrics('all');

    expect(result).toHaveProperty('gross_income');
    expect(result).toHaveProperty('total_expenses');
    expect(result).toHaveProperty('net_income');
    expect(result).toHaveProperty('net_per_hour');
  });

  it('handles zero gross and zero expenses', async () => {
    mockSql
      .mockResolvedValueOnce({ rows: [{ gross_income: '0', total_minutes: '0' }] })
      .mockResolvedValueOnce({ rows: [{ total_expenses: '0' }] });

    const result = await getDashboardMetrics('all');

    expect(result.gross_income).toBe(0);
    expect(result.total_expenses).toBe(0);
    expect(result.net_income).toBe(0);
    expect(result.net_per_hour).toBe(0);
  });
});

describe('getServiceTypeMetrics', () => {
  const fixtureRows = [
    {
      name: 'Manicure',
      total_sessions: '10',
      total_hours: '5.0',
      gross_income: '60.00',
      expense_share: '12.00',
      net_income: '48.00',
    },
    {
      name: 'Pedicure',
      total_sessions: '5',
      total_hours: '2.5',
      gross_income: '40.00',
      expense_share: '8.00',
      net_income: '32.00',
    },
  ];

  it('returns array with required fields', async () => {
    mockSql.mockResolvedValueOnce({ rows: fixtureRows });

    const result = await getServiceTypeMetrics('all');

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('total_sessions');
    expect(result[0]).toHaveProperty('total_hours');
    expect(result[0]).toHaveProperty('gross_income');
    expect(result[0]).toHaveProperty('expense_share');
    expect(result[0]).toHaveProperty('net_income');
  });

  it('parses numeric values correctly (expense_share = 60% of 20 = 12)', async () => {
    // typeA gross=60 is 60% of total 100; total_expenses=20; expense_share = 0.6*20 = 12
    mockSql.mockResolvedValueOnce({ rows: fixtureRows });

    const result = await getServiceTypeMetrics('all');

    expect(result[0].name).toBe('Manicure');
    expect(result[0].gross_income).toBe(60);
    expect(result[0].expense_share).toBe(12);
    expect(result[0].net_income).toBe(48);
    expect(result[0].total_sessions).toBe(10);
    expect(result[0].total_hours).toBe(5.0);
  });

  it('works for period=month', async () => {
    mockSql.mockResolvedValueOnce({ rows: fixtureRows });

    const result = await getServiceTypeMetrics('month');

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });

  it('returns empty array when no data', async () => {
    mockSql.mockResolvedValueOnce({ rows: [] });

    const result = await getServiceTypeMetrics('all');

    expect(result).toEqual([]);
  });
});

describe('getTrendData', () => {
  const fixtureTrendRows = [
    { month: '2024-01', gross: '100.00', expenses: '20.00', net: '80.00' },
    { month: '2024-02', gross: '150.00', expenses: '30.00', net: '120.00' },
  ];

  it('returns array of trend data with required fields', async () => {
    mockSql.mockResolvedValueOnce({ rows: fixtureTrendRows });

    const result = await getTrendData();

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('month');
    expect(result[0]).toHaveProperty('gross');
    expect(result[0]).toHaveProperty('expenses');
    expect(result[0]).toHaveProperty('net');
  });

  it('parses numeric values correctly', async () => {
    mockSql.mockResolvedValueOnce({ rows: fixtureTrendRows });

    const result = await getTrendData();

    expect(typeof result[0].gross).toBe('number');
    expect(result[0].gross).toBe(100);
    expect(result[0].expenses).toBe(20);
    expect(result[0].net).toBe(80);
  });

  it('preserves YYYY-MM month format', async () => {
    mockSql.mockResolvedValueOnce({ rows: fixtureTrendRows });

    const result = await getTrendData();

    expect(result[0].month).toBe('2024-01');
    expect(result[1].month).toBe('2024-02');
  });

  it('returns empty array when no data', async () => {
    mockSql.mockResolvedValueOnce({ rows: [] });

    const result = await getTrendData();

    expect(result).toEqual([]);
  });
});
