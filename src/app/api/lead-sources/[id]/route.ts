import { sql } from '@/lib/db';
import { LeadSourceSchema } from '@/lib/schemas';

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
    SELECT id, name, sort_order, created_at FROM lead_sources WHERE id = ${id}
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

  const existing = await sql`SELECT id FROM lead_sources WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    return jsonResponse({ error: 'Not found' }, 404);
  }

  try {
    const body = await request.json();
    const parsed = LeadSourceSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse({ error: 'Validation failed', details: parsed.error.issues }, 400);
    }

    const { name, sort_order } = parsed.data;

    const result = await sql`
      UPDATE lead_sources SET name = ${name}, sort_order = ${sort_order ?? 0}
      WHERE id = ${id}
      RETURNING id, name, sort_order, created_at
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

  const existing = await sql`SELECT id FROM lead_sources WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    return jsonResponse({ error: 'Not found' }, 404);
  }

  const inUse = await sql`
    SELECT 1 FROM customers WHERE lead_source_id = ${id} LIMIT 1
  `;

  if (inUse.rows.length > 0) {
    return jsonResponse(
      { error: 'Cannot delete: lead source is in use by customers', code: 'IN_USE' },
      409
    );
  }

  await sql`DELETE FROM lead_sources WHERE id = ${id}`;

  return new Response(null, { status: 204 });
}
