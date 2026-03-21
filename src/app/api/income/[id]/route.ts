import { sql } from '@/lib/db';
import { ApiError, json, parseIdParam, parseJsonBody, parseSchema, withApiHandler } from '@/lib/http';
import { IncomeEntrySchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const result = await sql`
    SELECT id, service_name, service_type_id, customer_id, date::text AS date, duration_minutes, amount, created_at
    FROM income_entries
    WHERE id = ${id}
  `;

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  return json(result.rows[0]);
});

export const PUT = withApiHandler(async (request, { params }) => {
  const id = parseIdParam(params.id);

  const existing = await sql`SELECT id FROM income_entries WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  const body = await parseJsonBody(request);
  const data = parseSchema(IncomeEntrySchema, body);

  const { service_name, service_type_id, customer_id, date, duration_minutes, amount } = data;

  const result = await sql`
    UPDATE income_entries
    SET service_name = ${service_name}, service_type_id = ${service_type_id},
        customer_id = ${customer_id ?? null}, date = ${date},
        duration_minutes = ${duration_minutes}, amount = ${amount}
    WHERE id = ${id}
    RETURNING id, service_name, service_type_id, customer_id, date::text AS date, duration_minutes, amount, created_at
  `;

  return json(result.rows[0]);
});

export const DELETE = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const existing = await sql`SELECT id FROM income_entries WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  await sql`DELETE FROM income_entries WHERE id = ${id}`;

  return new Response(null, { status: 204 });
});
