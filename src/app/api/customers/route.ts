import { sql } from '@/lib/db';
import { CustomerSchema, CustomerQuerySchema } from '@/lib/schemas';
import type { Customer } from '@/types';

export const dynamic = 'force-dynamic';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());

    const parsed = CustomerQuerySchema.safeParse(params);
    if (!parsed.success) {
      return jsonResponse({ error: 'Invalid query parameters', details: parsed.error.issues }, 400);
    }

    const { page, page_size = 20, search, lead_source_id, date_from, date_to } = parsed.data;
    const limit = Math.min(page_size, 200);
    const offset = (page - 1) * limit;
    const searchPattern = search ? `%${search.trim()}%` : null;

    const [countResult, dataResult] = await Promise.all([
      sql`
        SELECT COUNT(*) AS total
        FROM customers c
        WHERE (${searchPattern}::text IS NULL OR c.first_name ILIKE ${searchPattern} OR c.last_name ILIKE ${searchPattern} OR c.phone ILIKE ${searchPattern} OR c.email ILIKE ${searchPattern})
          AND (${lead_source_id ?? null}::int IS NULL OR c.lead_source_id = ${lead_source_id ?? null})
          AND (${date_from ?? null}::date IS NULL OR EXISTS (SELECT 1 FROM income_entries ie WHERE ie.customer_id = c.id AND ie.date >= ${date_from ?? null}))
          AND (${date_to ?? null}::date IS NULL OR EXISTS (SELECT 1 FROM income_entries ie WHERE ie.customer_id = c.id AND ie.date <= ${date_to ?? null}))
      `,
      sql`
        SELECT
          c.id, c.first_name, c.last_name, c.phone, c.email, c.lead_source_id,
          c.questionnaire_data, c.created_at, c.updated_at,
          ls.name AS lead_source_name,
          (SELECT MAX(ie.date) FROM income_entries ie WHERE ie.customer_id = c.id) AS last_visit
        FROM customers c
        LEFT JOIN lead_sources ls ON ls.id = c.lead_source_id
        WHERE (${searchPattern}::text IS NULL OR c.first_name ILIKE ${searchPattern} OR c.last_name ILIKE ${searchPattern} OR c.phone ILIKE ${searchPattern} OR c.email ILIKE ${searchPattern})
          AND (${lead_source_id ?? null}::int IS NULL OR c.lead_source_id = ${lead_source_id ?? null})
          AND (${date_from ?? null}::date IS NULL OR EXISTS (SELECT 1 FROM income_entries ie WHERE ie.customer_id = c.id AND ie.date >= ${date_from ?? null}))
          AND (${date_to ?? null}::date IS NULL OR EXISTS (SELECT 1 FROM income_entries ie WHERE ie.customer_id = c.id AND ie.date <= ${date_to ?? null}))
        ORDER BY c.last_name ASC, c.first_name ASC
        LIMIT ${limit} OFFSET ${offset}
      `,
    ]);

    const total = parseInt((countResult.rows[0] as { total: string }).total, 10);
    const data = dataResult.rows as (Customer & { lead_source_name?: string; last_visit?: string })[];

    return jsonResponse({ data, total, page, pageSize: limit });
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = CustomerSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse({ error: 'Validation failed', details: parsed.error.issues }, 400);
    }

    const { first_name, last_name, phone, email, lead_source_id, questionnaire_data } = parsed.data;

    const result = await sql`
      INSERT INTO customers (first_name, last_name, phone, email, lead_source_id, questionnaire_data)
      VALUES (${first_name}, ${last_name}, ${phone ?? null}, ${email ?? null}, ${lead_source_id ?? null}, ${JSON.stringify(questionnaire_data ?? {})}::jsonb)
      RETURNING id, first_name, last_name, phone, email, lead_source_id, questionnaire_data, created_at, updated_at
    `;

    const row = result.rows[0] as Record<string, unknown>;
    if (row?.questionnaire_data && typeof row.questionnaire_data === 'string') {
      row.questionnaire_data = JSON.parse(row.questionnaire_data as string) as Record<string, unknown>;
    }

    return jsonResponse(row, 201);
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
