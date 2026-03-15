import { sql } from '@/lib/db';
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
    const offset = (page - 1) * 20;

    const [countResult, dataResult] = await Promise.all([
      sql`
        SELECT COUNT(*) AS total
        FROM expense_entries
        WHERE (${category}::text IS NULL OR category = ${category ?? null})
          AND (${date_from}::date IS NULL OR date >= ${date_from ?? null})
          AND (${date_to}::date IS NULL OR date <= ${date_to ?? null})
      `,
      sql`
        SELECT id, description, category, date, amount, created_at
        FROM expense_entries
        WHERE (${category}::text IS NULL OR category = ${category ?? null})
          AND (${date_from}::date IS NULL OR date >= ${date_from ?? null})
          AND (${date_to}::date IS NULL OR date <= ${date_to ?? null})
        ORDER BY date DESC, id DESC
        LIMIT 20 OFFSET ${offset}
      `,
    ]);

    const total = parseInt((countResult.rows[0] as { total: string }).total, 10);
    const data = dataResult.rows as ExpenseEntry[];

    return jsonResponse({ data, total, page, pageSize: 20 });
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
