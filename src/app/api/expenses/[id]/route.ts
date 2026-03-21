import { sql } from '@/lib/db';
import { ApiError, json, parseIdParam, parseJsonBody, parseSchema, withApiHandler } from '@/lib/http';
import { ExpenseEntrySchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const result = await sql`
    SELECT id, description, category, date, amount, created_at
    FROM expense_entries
    WHERE id = ${id}
  `;

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  return json(result.rows[0]);
});

export const PUT = withApiHandler(async (request, { params }) => {
  const id = parseIdParam(params.id);

  const existing = await sql`SELECT id FROM expense_entries WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  const body = await parseJsonBody(request);
  const data = parseSchema(ExpenseEntrySchema, body);

  const { description, category, date, amount } = data;

  const result = await sql`
    UPDATE expense_entries
    SET description = ${description}, category = ${category}, date = ${date}, amount = ${amount}
    WHERE id = ${id}
    RETURNING id, description, category, date, amount, created_at
  `;

  return json(result.rows[0]);
});

export const DELETE = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const existing = await sql`SELECT id FROM expense_entries WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  await sql`DELETE FROM expense_entries WHERE id = ${id}`;

  return new Response(null, { status: 204 });
});
