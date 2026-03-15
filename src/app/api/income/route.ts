import { sql, query } from '@/lib/db';
import { IncomeEntrySchema, IncomeQuerySchema } from '@/lib/schemas';
import type { IncomeEntry } from '@/types';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = IncomeEntrySchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse({ error: 'Validation failed', details: parsed.error.issues }, 400);
    }

    const { service_name, service_type_id, date, duration_minutes, amount } = parsed.data;

    const result = await sql`
      INSERT INTO income_entries (service_name, service_type_id, date, duration_minutes, amount)
      VALUES (${service_name}, ${service_type_id}, ${date}, ${duration_minutes}, ${amount})
      RETURNING id, service_name, service_type_id, date, duration_minutes, amount, created_at
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

    const parsed = IncomeQuerySchema.safeParse(params);
    if (!parsed.success) {
      return jsonResponse({ error: 'Invalid query parameters', details: parsed.error.issues }, 400);
    }

    const { page, service_type_id, date_from, date_to } = parsed.data;

    const conditions: string[] = [];
    const queryParams: unknown[] = [];

    if (service_type_id !== undefined) {
      queryParams.push(service_type_id);
      conditions.push(`service_type_id = $${queryParams.length}`);
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
      query<{ total: string }>(`SELECT COUNT(*) AS total FROM income_entries ${where}`, queryParams),
      query<IncomeEntry>(
        `SELECT * FROM income_entries ${where} ORDER BY date DESC, id DESC LIMIT 20 OFFSET $${queryParams.length + 1}`,
        [...queryParams, offset]
      ),
    ]);

    const total = parseInt(countRows[0].total, 10);

    return jsonResponse({ data: dataRows, total, page, pageSize: 20 });
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
