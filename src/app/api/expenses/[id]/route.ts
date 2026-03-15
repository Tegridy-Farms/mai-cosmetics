import { sql } from '@/lib/db';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return jsonResponse({ error: 'Invalid id' }, 400);
  }

  const existing = await sql`SELECT id FROM expense_entries WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    return jsonResponse({ error: 'Not found' }, 404);
  }

  await sql`DELETE FROM expense_entries WHERE id = ${id}`;

  return new Response(null, { status: 204 });
}
