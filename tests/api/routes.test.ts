// Must mock before any imports
jest.mock('@/lib/db', () => ({
  sql: jest.fn(),
  query: jest.fn(),
}));

jest.mock('@/lib/calculations', () => ({
  getDashboardMetrics: jest.fn(),
  getServiceTypeMetrics: jest.fn(),
  getTrendData: jest.fn(),
}));

import { sql, query } from '@/lib/db';
import * as calculations from '@/lib/calculations';

import { GET as getServiceTypes } from '@/app/api/service-types/route';
import { GET as getIncome, POST as postIncome } from '@/app/api/income/route';
import { DELETE as deleteIncome } from '@/app/api/income/[id]/route';
import { GET as exportIncome } from '@/app/api/income/export/route';
import { GET as getExpenses, POST as postExpenses } from '@/app/api/expenses/route';
import { DELETE as deleteExpense } from '@/app/api/expenses/[id]/route';
import { GET as exportExpenses } from '@/app/api/expenses/export/route';
import { GET as getDashboard } from '@/app/api/dashboard/route';
import { GET as getDashboardTrend } from '@/app/api/dashboard/trend/route';

const mockSql = sql as unknown as jest.Mock;
const mockQuery = query as unknown as jest.Mock;
const mockGetDashboardMetrics = calculations.getDashboardMetrics as jest.Mock;
const mockGetServiceTypeMetrics = calculations.getServiceTypeMetrics as jest.Mock;
const mockGetTrendData = calculations.getTrendData as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// GET /api/service-types
// ---------------------------------------------------------------------------
describe('GET /api/service-types', () => {
  it('returns 200 with array of service types', async () => {
    mockSql.mockResolvedValueOnce({
      rows: [
        { id: 1, name: 'Manicure' },
        { id: 2, name: 'Pedicure' },
      ],
    });

    const response = await getServiceTypes();

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([
      { id: 1, name: 'Manicure' },
      { id: 2, name: 'Pedicure' },
    ]);
  });

  it('returns 500 on DB error', async () => {
    mockSql.mockRejectedValueOnce(new Error('DB down'));

    const response = await getServiceTypes();

    expect(response.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// POST /api/income
// ---------------------------------------------------------------------------
describe('POST /api/income', () => {
  const validBody = {
    service_name: 'Gel Manicure',
    service_type_id: 3,
    date: '2024-03-01',
    duration_minutes: 90,
    amount: 55.0,
  };

  it('returns 400 with validation error on invalid input', async () => {
    const request = new Request('http://localhost/api/income', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_name: '', service_type_id: 1, date: '2024-01-01', duration_minutes: 0, amount: 50 }),
    });

    const response = await postIncome(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Validation failed');
    expect(Array.isArray(data.details)).toBe(true);
  });

  it('returns 201 with created resource on valid input', async () => {
    const created = { id: 1, ...validBody, created_at: '2024-03-01T00:00:00.000Z' };
    mockSql.mockResolvedValueOnce({ rows: [created] });

    const request = new Request('http://localhost/api/income', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    const response = await postIncome(request);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBe(1);
    expect(data.service_name).toBe('Gel Manicure');
  });

  it('returns 400 on missing required fields', async () => {
    const request = new Request('http://localhost/api/income', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_name: 'Test' }),
    });

    const response = await postIncome(request);

    expect(response.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    mockSql.mockRejectedValueOnce(new Error('DB error'));

    const request = new Request('http://localhost/api/income', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    const response = await postIncome(request);

    expect(response.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// GET /api/income
// ---------------------------------------------------------------------------
describe('GET /api/income', () => {
  it('returns 200 with paginated data', async () => {
    mockSql
      .mockResolvedValueOnce({ rows: [{ total: '3' }] })
      .mockResolvedValueOnce({
        rows: [
          { id: 1, service_name: 'Manicure', date: '2024-03-01', amount: 45 },
          { id: 2, service_name: 'Pedicure', date: '2024-02-28', amount: 55 },
        ],
      });

    const response = await getIncome(new Request('http://localhost/api/income'));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.total).toBe(3);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(20);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('applies page param correctly', async () => {
    mockSql
      .mockResolvedValueOnce({ rows: [{ total: '25' }] })
      .mockResolvedValueOnce({ rows: [] });

    const response = await getIncome(new Request('http://localhost/api/income?page=2'));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.page).toBe(2);
  });

  it('returns 400 on invalid query params', async () => {
    const response = await getIncome(
      new Request('http://localhost/api/income?date_from=not-a-date')
    );

    expect(response.status).toBe(400);
  });

  it('accepts service_type_id filter', async () => {
    mockSql
      .mockResolvedValueOnce({ rows: [{ total: '1' }] })
      .mockResolvedValueOnce({ rows: [{ id: 3, service_name: 'Gel Nails' }] });

    const response = await getIncome(
      new Request('http://localhost/api/income?service_type_id=3')
    );

    expect(response.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/income/[id]
// ---------------------------------------------------------------------------
describe('DELETE /api/income/[id]', () => {
  it('returns 404 when income entry not found', async () => {
    mockSql.mockResolvedValueOnce({ rows: [] });

    const response = await deleteIncome(
      new Request('http://localhost/api/income/999'),
      { params: { id: '999' } }
    );

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Not found');
  });

  it('returns 204 when income entry is deleted', async () => {
    mockSql
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })
      .mockResolvedValueOnce({ rows: [] });

    const response = await deleteIncome(
      new Request('http://localhost/api/income/1'),
      { params: { id: '1' } }
    );

    expect(response.status).toBe(204);
  });

  it('returns 400 for non-numeric id', async () => {
    const response = await deleteIncome(
      new Request('http://localhost/api/income/abc'),
      { params: { id: 'abc' } }
    );

    expect(response.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /api/income/export
// ---------------------------------------------------------------------------
describe('GET /api/income/export', () => {
  it('returns CSV with correct headers', async () => {
    mockSql.mockResolvedValueOnce({
      rows: [
        {
          date: '2024-03-01',
          service_name: 'Manicure',
          service_type_name: 'Manicure',
          duration_minutes: 60,
          amount: 45.0,
        },
      ],
    });

    const response = await exportIncome();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv');
    expect(response.headers.get('Content-Disposition')).toMatch(
      /attachment; filename="mai-cosmetics-income-\d{4}-\d{2}-\d{2}\.csv"/
    );
  });

  it('CSV body contains header row and data', async () => {
    mockSql.mockResolvedValueOnce({
      rows: [
        {
          date: '2024-03-01',
          service_name: 'Manicure',
          service_type_name: 'Manicure',
          duration_minutes: 60,
          amount: 45.0,
        },
      ],
    });

    const response = await exportIncome();
    const text = await response.text();

    expect(text).toContain('Date,Service Name,Service Type,Duration (min),Amount');
    expect(text).toContain('2024-03-01');
    expect(text).toContain('Manicure');
  });
});

// ---------------------------------------------------------------------------
// POST /api/expenses
// ---------------------------------------------------------------------------
describe('POST /api/expenses', () => {
  const validBody = {
    description: 'Nail polish refill',
    category: 'consumables',
    date: '2024-03-01',
    amount: 30.0,
  };

  it('returns 400 with validation error on invalid input', async () => {
    const request = new Request('http://localhost/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: '', category: 'consumables', date: '2024-01-01', amount: 0 }),
    });

    const response = await postExpenses(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Validation failed');
    expect(Array.isArray(data.details)).toBe(true);
  });

  it('returns 201 with created resource on valid input', async () => {
    const created = { id: 1, ...validBody, created_at: '2024-03-01T00:00:00.000Z' };
    mockSql.mockResolvedValueOnce({ rows: [created] });

    const request = new Request('http://localhost/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    const response = await postExpenses(request);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBe(1);
    expect(data.description).toBe('Nail polish refill');
  });

  it('rejects invalid category', async () => {
    const request = new Request('http://localhost/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validBody, category: 'invalid-cat' }),
    });

    const response = await postExpenses(request);

    expect(response.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /api/expenses
// ---------------------------------------------------------------------------
describe('GET /api/expenses', () => {
  it('returns 200 with paginated data', async () => {
    mockSql
      .mockResolvedValueOnce({ rows: [{ total: '2' }] })
      .mockResolvedValueOnce({
        rows: [
          { id: 1, description: 'Supplies', category: 'consumables', date: '2024-03-01', amount: 25 },
        ],
      });

    const response = await getExpenses(new Request('http://localhost/api/expenses'));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.total).toBe(2);
    expect(body.pageSize).toBe(20);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('accepts category filter', async () => {
    mockSql
      .mockResolvedValueOnce({ rows: [{ total: '1' }] })
      .mockResolvedValueOnce({ rows: [{ id: 1, description: 'Equipment', category: 'equipment' }] });

    const response = await getExpenses(
      new Request('http://localhost/api/expenses?category=equipment')
    );

    expect(response.status).toBe(200);
  });

  it('returns 400 on invalid query params', async () => {
    const response = await getExpenses(
      new Request('http://localhost/api/expenses?category=bad-cat')
    );

    expect(response.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/expenses/[id]
// ---------------------------------------------------------------------------
describe('DELETE /api/expenses/[id]', () => {
  it('returns 404 when expense entry not found', async () => {
    mockSql.mockResolvedValueOnce({ rows: [] });

    const response = await deleteExpense(
      new Request('http://localhost/api/expenses/999'),
      { params: { id: '999' } }
    );

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Not found');
  });

  it('returns 204 when expense entry is deleted', async () => {
    mockSql
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })
      .mockResolvedValueOnce({ rows: [] });

    const response = await deleteExpense(
      new Request('http://localhost/api/expenses/1'),
      { params: { id: '1' } }
    );

    expect(response.status).toBe(204);
  });

  it('returns 400 for non-numeric id', async () => {
    const response = await deleteExpense(
      new Request('http://localhost/api/expenses/abc'),
      { params: { id: 'abc' } }
    );

    expect(response.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /api/expenses/export
// ---------------------------------------------------------------------------
describe('GET /api/expenses/export', () => {
  it('returns CSV with correct headers', async () => {
    mockSql.mockResolvedValueOnce({
      rows: [
        { date: '2024-03-01', description: 'Nail polish', category: 'consumables', amount: 25.0 },
      ],
    });

    const response = await exportExpenses();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv');
    expect(response.headers.get('Content-Disposition')).toMatch(
      /attachment; filename="mai-cosmetics-expenses-\d{4}-\d{2}-\d{2}\.csv"/
    );
  });

  it('CSV body contains header row and data', async () => {
    mockSql.mockResolvedValueOnce({
      rows: [
        { date: '2024-03-01', description: 'Nail polish', category: 'consumables', amount: 25.0 },
      ],
    });

    const response = await exportExpenses();
    const text = await response.text();

    expect(text).toContain('Date,Description,Category,Amount');
    expect(text).toContain('2024-03-01');
    expect(text).toContain('Nail polish');
  });
});

// ---------------------------------------------------------------------------
// GET /api/dashboard
// ---------------------------------------------------------------------------
describe('GET /api/dashboard', () => {
  const metricsFixture = {
    gross_income: 500,
    total_expenses: 100,
    net_income: 400,
    net_per_hour: 50,
  };

  const serviceTypesFixture = [
    { name: 'Manicure', total_sessions: 10, total_hours: 5, gross_income: 300, expense_share: 60, net_income: 240 },
  ];

  it('returns 200 with metrics and by_service_type (default period=month)', async () => {
    mockGetDashboardMetrics.mockResolvedValueOnce(metricsFixture);
    mockGetServiceTypeMetrics.mockResolvedValueOnce(serviceTypesFixture);

    const response = await getDashboard(new Request('http://localhost/api/dashboard'));

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.gross_income).toBe(500);
    expect(data.total_expenses).toBe(100);
    expect(data.net_income).toBe(400);
    expect(data.net_per_hour).toBe(50);
    expect(Array.isArray(data.by_service_type)).toBe(true);
    expect(mockGetDashboardMetrics).toHaveBeenCalledWith('month');
  });

  it('passes period=all to getDashboardMetrics', async () => {
    mockGetDashboardMetrics.mockResolvedValueOnce(metricsFixture);
    mockGetServiceTypeMetrics.mockResolvedValueOnce(serviceTypesFixture);

    await getDashboard(new Request('http://localhost/api/dashboard?period=all'));

    expect(mockGetDashboardMetrics).toHaveBeenCalledWith('all');
    expect(mockGetServiceTypeMetrics).toHaveBeenCalledWith('all');
  });

  it('returns 400 for invalid period', async () => {
    const response = await getDashboard(
      new Request('http://localhost/api/dashboard?period=invalid')
    );

    expect(response.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /api/dashboard/trend
// ---------------------------------------------------------------------------
describe('GET /api/dashboard/trend', () => {
  it('returns 200 with months array', async () => {
    const trendFixture = [
      { month: '2024-01', gross: 100, expenses: 20, net: 80 },
      { month: '2024-02', gross: 150, expenses: 30, net: 120 },
    ];
    mockGetTrendData.mockResolvedValueOnce(trendFixture);

    const response = await getDashboardTrend(new Request('http://localhost/api/dashboard/trend'));

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.months)).toBe(true);
    expect(data.months).toHaveLength(2);
    expect(data.months[0].month).toBe('2024-01');
  });

  it('returns 500 on calculation error', async () => {
    mockGetTrendData.mockRejectedValueOnce(new Error('DB error'));

    const response = await getDashboardTrend(new Request('http://localhost/api/dashboard/trend'));

    expect(response.status).toBe(500);
  });
});
