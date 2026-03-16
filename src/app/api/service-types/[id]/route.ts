import { sql } from '@/lib/db';
import { ServiceTypeSchema } from '@/lib/schemas';

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
    SELECT id, name, default_price, created_at FROM service_types WHERE id = ${id}
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

  const existing = await sql`SELECT id FROM service_types WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    return jsonResponse({ error: 'Not found' }, 404);
  }

  try {
    const body = await request.json();
    const parsed = ServiceTypeSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse({ error: 'Validation failed', details: parsed.error.issues }, 400);
    }

    const { name, default_price } = parsed.data;

    const result = await sql`
      UPDATE service_types SET name = ${name}, default_price = ${default_price ?? null}
      WHERE id = ${id}
      RETURNING id, name, default_price, created_at
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

  const existing = await sql`SELECT id FROM service_types WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    return jsonResponse({ error: 'Not found' }, 404);
  }

  const inUse = await sql`
    SELECT 1 FROM income_entries WHERE service_type_id = ${id} LIMIT 1
  `;

  if (inUse.rows.length > 0) {
    return jsonResponse(
      { error: 'Cannot delete: service type is in use', code: 'IN_USE' },
      409
    );
  }

  await sql`DELETE FROM service_types WHERE id = ${id}`;

  return new Response(null, { status: 204 });
}
