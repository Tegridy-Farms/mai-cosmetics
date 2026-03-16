import { sql } from '@/lib/db';
import { CustomerSchema } from '@/lib/schemas';
import type { Customer } from '@/types';

export const dynamic = 'force-dynamic';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return jsonResponse({ error: 'Invalid id' }, 400);
  }

  const result = await sql`
    SELECT
      c.id, c.first_name, c.last_name, c.phone, c.email, c.lead_source_id,
      c.questionnaire_data, c.created_at, c.updated_at,
      ls.name AS lead_source_name,
      (SELECT MAX(ie.date) FROM income_entries ie WHERE ie.customer_id = c.id) AS last_visit
    FROM customers c
    LEFT JOIN lead_sources ls ON ls.id = c.lead_source_id
    WHERE c.id = ${id}
  `;

  if (result.rows.length === 0) {
    return jsonResponse({ error: 'Not found' }, 404);
  }

  return jsonResponse(result.rows[0]);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return jsonResponse({ error: 'Invalid id' }, 400);
  }

  const existing = await sql`SELECT id FROM customers WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    return jsonResponse({ error: 'Not found' }, 404);
  }

  try {
    const body = await request.json();
    const parsed = CustomerSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse({ error: 'Validation failed', details: parsed.error.issues }, 400);
    }

    const { first_name, last_name, phone, email, lead_source_id, questionnaire_data } = parsed.data;

    const result = await sql`
      UPDATE customers
      SET
        first_name = ${first_name},
        last_name = ${last_name},
        phone = ${phone ?? null},
        email = ${email ?? null},
        lead_source_id = ${lead_source_id ?? null},
        questionnaire_data = ${JSON.stringify(questionnaire_data ?? {})}::jsonb,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, first_name, last_name, phone, email, lead_source_id, questionnaire_data, created_at, updated_at
    `;

    return jsonResponse(result.rows[0]);
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return jsonResponse({ error: 'Invalid id' }, 400);
  }

  const existing = await sql`SELECT id FROM customers WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    return jsonResponse({ error: 'Not found' }, 404);
  }

  const inUse = await sql`
    SELECT 1 FROM income_entries WHERE customer_id = ${id} LIMIT 1
  `;

  if (inUse.rows.length > 0) {
    return jsonResponse(
      { error: 'Cannot delete: customer has linked income entries', code: 'IN_USE' },
      409
    );
  }

  await sql`DELETE FROM customers WHERE id = ${id}`;

  return new Response(null, { status: 204 });
}
