import { sql, query } from '@/lib/db';
import { ExpenseEntrySchema, ExpenseQuerySchema } from '@/lib/schemas';
import type { ExpenseEntry } from '@/types';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = ExpenseEntrySchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse({ error: 'Validation failed', details: parsed.error.issues }, 400);
    }

    const { description, category, date, amount } = parsed.data;

    const result = await sql`
      INSERT INTO expense_entries (description, category, date, amount)
      VALUES (${description}, ${category}, ${date}, ${amount})
      RETURNING id, description, category, date, amount, created_at
    `;

    return jsonResponse(result.rows[0], 201);
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());

    const parsed = ExpenseQuerySchema.safeParse(params);
    if (!parsed.success) {
      return jsonResponse({ error: 'Invalid query parameters', details: parsed.error.issues }, 400);
    }

    const { page, category, date_from, date_to } = parsed.data;

    const conditions: string[] = [];
    const queryParams: unknown[] = [];

    if (category !== undefined) {
      queryParams.push(category);
      conditions.push(`category = $${queryParams.length}`);
    }
    if (date_from) {
      queryParams.push(date_from);
      conditions.push(`date >= $${queryParams.length}`);
    }
    if (date_to) {
      queryParams.push(date_to);
      conditions.push(`date <= $${queryParams.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * 20;

    const [countRows, dataRows] = await Promise.all([
      query<{ total: string }>(`SELECT COUNT(*) AS total FROM expense_entries ${where}`, queryParams),
      query<ExpenseEntry>(
        `SELECT * FROM expense_entries ${where} ORDER BY date DESC, id DESC LIMIT 20 OFFSET $${queryParams.length + 1}`,
        [...queryParams, offset]
      ),
    ]);

    const total = parseInt(countRows[0].total, 10);

    return jsonResponse({ data: dataRows, total, page, pageSize: 20 });
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
