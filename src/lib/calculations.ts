import { sql } from '@/lib/db';
import type { ServiceTypeMetric, MonthlyTrend } from '@/types';

export interface DashboardMetricsResult {
  gross_income: number;
  total_expenses: number;
  net_income: number;
  net_per_hour: number;
}

export async function getDashboardMetrics(
  period: 'month' | 'all'
): Promise<DashboardMetricsResult> {
  type IncomeRow = { gross_income: string; total_minutes: string };
  type ExpenseRow = { total_expenses: string };

  let incomeResult: { rows: IncomeRow[] };
  let expenseResult: { rows: ExpenseRow[] };

  if (period === 'month') {
    [incomeResult, expenseResult] = await Promise.all([
      sql`
        SELECT
          COALESCE(SUM(amount), 0) AS gross_income,
          COALESCE(SUM(duration_minutes), 0) AS total_minutes
        FROM income_entries
        WHERE date >= date_trunc('month', NOW())
          AND date < date_trunc('month', NOW()) + INTERVAL '1 month'
      ` as unknown as Promise<{ rows: IncomeRow[] }>,
      sql`
        SELECT COALESCE(SUM(amount), 0) AS total_expenses
        FROM expense_entries
        WHERE date >= date_trunc('month', NOW())
          AND date < date_trunc('month', NOW()) + INTERVAL '1 month'
      ` as unknown as Promise<{ rows: ExpenseRow[] }>,
    ]);
  } else {
    [incomeResult, expenseResult] = await Promise.all([
      sql`
        SELECT
          COALESCE(SUM(amount), 0) AS gross_income,
          COALESCE(SUM(duration_minutes), 0) AS total_minutes
        FROM income_entries
      ` as unknown as Promise<{ rows: IncomeRow[] }>,
      sql`
        SELECT COALESCE(SUM(amount), 0) AS total_expenses
        FROM expense_entries
      ` as unknown as Promise<{ rows: ExpenseRow[] }>,
    ]);
  }

  const gross_income = parseFloat(incomeResult.rows[0].gross_income ?? '0');
  const total_minutes = parseFloat(incomeResult.rows[0].total_minutes ?? '0');
  const total_expenses = parseFloat(expenseResult.rows[0].total_expenses ?? '0');
  const net_income = gross_income - total_expenses;
  const net_per_hour = total_minutes > 0 ? net_income / (total_minutes / 60) : 0;

  return { gross_income, total_expenses, net_income, net_per_hour };
}

export async function getServiceTypeMetrics(period: 'month' | 'all'): Promise<ServiceTypeMetric[]> {
  type ServiceTypeRow = {
    name: string;
    total_sessions: string;
    total_hours: string;
    gross_income: string;
    expense_share: string;
    net_income: string;
  };

  let result: { rows: ServiceTypeRow[] };

  if (period === 'month') {
    result = await sql`
      WITH expense_total AS (
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM expense_entries
        WHERE date >= date_trunc('month', NOW())
          AND date < date_trunc('month', NOW()) + INTERVAL '1 month'
      ),
      income_by_type AS (
        SELECT
          st.name,
          COUNT(*) AS total_sessions,
          SUM(i.duration_minutes) / 60.0 AS total_hours,
          SUM(i.amount) AS gross_income
        FROM income_entries i
        JOIN service_types st ON i.service_type_id = st.id
        WHERE i.date >= date_trunc('month', NOW())
          AND i.date < date_trunc('month', NOW()) + INTERVAL '1 month'
        GROUP BY st.id, st.name
      ),
      income_grand_total AS (
        SELECT COALESCE(SUM(gross_income), 0) AS grand_total FROM income_by_type
      )
      SELECT
        ibt.name,
        ibt.total_sessions,
        ibt.total_hours,
        ibt.gross_income,
        ROUND(CAST(et.total * ibt.gross_income / NULLIF(igt.grand_total, 0) AS NUMERIC), 2) AS expense_share,
        ROUND(CAST(ibt.gross_income - (et.total * ibt.gross_income / NULLIF(igt.grand_total, 0)) AS NUMERIC), 2) AS net_income
      FROM income_by_type ibt
      CROSS JOIN expense_total et
      CROSS JOIN income_grand_total igt
      ORDER BY ibt.gross_income DESC
    ` as unknown as { rows: ServiceTypeRow[] };
  } else {
    result = await sql`
      WITH expense_total AS (
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM expense_entries
      ),
      income_by_type AS (
        SELECT
          st.name,
          COUNT(*) AS total_sessions,
          SUM(i.duration_minutes) / 60.0 AS total_hours,
          SUM(i.amount) AS gross_income
        FROM income_entries i
        JOIN service_types st ON i.service_type_id = st.id
        GROUP BY st.id, st.name
      ),
      income_grand_total AS (
        SELECT COALESCE(SUM(gross_income), 0) AS grand_total FROM income_by_type
      )
      SELECT
        ibt.name,
        ibt.total_sessions,
        ibt.total_hours,
        ibt.gross_income,
        ROUND(CAST(et.total * ibt.gross_income / NULLIF(igt.grand_total, 0) AS NUMERIC), 2) AS expense_share,
        ROUND(CAST(ibt.gross_income - (et.total * ibt.gross_income / NULLIF(igt.grand_total, 0)) AS NUMERIC), 2) AS net_income
      FROM income_by_type ibt
      CROSS JOIN expense_total et
      CROSS JOIN income_grand_total igt
      ORDER BY ibt.gross_income DESC
    ` as unknown as { rows: ServiceTypeRow[] };
  }

  return result.rows.map((row) => ({
    name: row.name,
    total_sessions: parseInt(row.total_sessions, 10),
    total_hours: parseFloat(row.total_hours),
    gross_income: parseFloat(row.gross_income),
    expense_share: parseFloat(row.expense_share),
    net_income: parseFloat(row.net_income),
  }));
}

export async function getTrendData(): Promise<MonthlyTrend[]> {
  type TrendRow = { month: string; gross: string; expenses: string; net: string };
  const result = await sql`
    WITH months AS (
      SELECT generate_series(
        date_trunc('month', NOW()) - INTERVAL '11 months',
        date_trunc('month', NOW()),
        '1 month'::interval
      ) AS month
    ),
    income_monthly AS (
      SELECT
        date_trunc('month', date) AS month,
        SUM(amount) AS gross
      FROM income_entries
      GROUP BY date_trunc('month', date)
    ),
    expense_monthly AS (
      SELECT
        date_trunc('month', date) AS month,
        SUM(amount) AS expenses
      FROM expense_entries
      GROUP BY date_trunc('month', date)
    )
    SELECT
      to_char(m.month, 'YYYY-MM') AS month,
      COALESCE(im.gross, 0) AS gross,
      COALESCE(em.expenses, 0) AS expenses,
      COALESCE(im.gross, 0) - COALESCE(em.expenses, 0) AS net
    FROM months m
    LEFT JOIN income_monthly im ON m.month = im.month
    LEFT JOIN expense_monthly em ON m.month = em.month
    ORDER BY m.month ASC
  ` as unknown as { rows: TrendRow[] };

  return result.rows.map(
    (row) => ({
      month: row.month,
      gross: parseFloat(row.gross),
      expenses: parseFloat(row.expenses),
      net: parseFloat(row.net),
    })
  );
}
