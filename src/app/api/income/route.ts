import { sql } from '@/lib/db';
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

    const { service_name, service_type_id, customer_id, date, duration_minutes, amount } = parsed.data;

    const result = await sql`
      INSERT INTO income_entries (service_name, service_type_id, customer_id, date, duration_minutes, amount)
      VALUES (${service_name}, ${service_type_id}, ${customer_id ?? null}, ${date}, ${duration_minutes}, ${amount})
      RETURNING id, service_name, service_type_id, customer_id, date, duration_minutes, amount, created_at
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

    const { page, service_type_id, customer_id, date_from, date_to } = parsed.data;
    const offset = (page - 1) * 20;

    const [countResult, dataResult] = await Promise.all([
      sql`
        SELECT COUNT(*) AS total
        FROM income_entries
        WHERE (${service_type_id ?? null}::int IS NULL OR service_type_id = ${service_type_id ?? null})
          AND (${customer_id ?? null}::int IS NULL OR customer_id = ${customer_id ?? null})
          AND (${date_from ?? null}::date IS NULL OR date >= ${date_from ?? null})
          AND (${date_to ?? null}::date IS NULL OR date <= ${date_to ?? null})
      `,
      sql`
        SELECT id, service_name, service_type_id, customer_id, date, duration_minutes, amount, created_at
        FROM income_entries
        WHERE (${service_type_id ?? null}::int IS NULL OR service_type_id = ${service_type_id ?? null})
          AND (${customer_id ?? null}::int IS NULL OR customer_id = ${customer_id ?? null})
          AND (${date_from ?? null}::date IS NULL OR date >= ${date_from ?? null})
          AND (${date_to ?? null}::date IS NULL OR date <= ${date_to ?? null})
        ORDER BY date DESC, id DESC
        LIMIT 20 OFFSET ${offset}
      `,
    ]);

    const total = parseInt((countResult.rows[0] as { total: string }).total, 10);
    const data = dataResult.rows as IncomeEntry[];

    return jsonResponse({ data, total, page, pageSize: 20 });
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
