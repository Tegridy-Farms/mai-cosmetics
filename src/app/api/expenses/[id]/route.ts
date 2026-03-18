import { sql } from '@/lib/db';
import { ExpenseEntrySchema } from '@/lib/schemas';

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
    SELECT id, description, category, date, amount, created_at
    FROM expense_entries
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

  const existing = await sql`SELECT id FROM expense_entries WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    return jsonResponse({ error: 'Not found' }, 404);
  }

  try {
    const body = await request.json();
    const parsed = ExpenseEntrySchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse({ error: 'Validation failed', details: parsed.error.issues }, 400);
    }

    const { description, category, date, amount } = parsed.data;

    const result = await sql`
      UPDATE expense_entries
      SET description = ${description}, category = ${category}, date = ${date}, amount = ${amount}
      WHERE id = ${id}
      RETURNING id, description, category, date, amount, created_at
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

  const existing = await sql`SELECT id FROM expense_entries WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    return jsonResponse({ error: 'Not found' }, 404);
  }

  await sql`DELETE FROM expense_entries WHERE id = ${id}`;

  return new Response(null, { status: 204 });
}
