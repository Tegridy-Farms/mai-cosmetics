import { sql } from '@/lib/db';
import { IncomeEntrySchema } from '@/lib/schemas';

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
    SELECT id, service_name, service_type_id, customer_id, date, duration_minutes, amount, created_at
    FROM income_entries
    WHERE id = ${id}
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

  const existing = await sql`SELECT id FROM income_entries WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    return jsonResponse({ error: 'Not found' }, 404);
  }

  try {
    const body = await request.json();
    const parsed = IncomeEntrySchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse({ error: 'Validation failed', details: parsed.error.issues }, 400);
    }

    const { service_name, service_type_id, customer_id, date, duration_minutes, amount } = parsed.data;

    const result = await sql`
      UPDATE income_entries
      SET service_name = ${service_name}, service_type_id = ${service_type_id},
          customer_id = ${customer_id ?? null}, date = ${date},
          duration_minutes = ${duration_minutes}, amount = ${amount}
      WHERE id = ${id}
      RETURNING id, service_name, service_type_id, customer_id, date, duration_minutes, amount, created_at
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

  const existing = await sql`SELECT id FROM income_entries WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    return jsonResponse({ error: 'Not found' }, 404);
  }

  await sql`DELETE FROM income_entries WHERE id = ${id}`;

  return new Response(null, { status: 204 });
}
