import { sql } from '@/lib/db';
import { ApiError, json, parseIdParam, parseJsonBody, parseSchema, withApiHandler } from '@/lib/http';
import { asSqlString } from '@/lib/sql-primitive';
import { CustomerSchema } from '@/lib/schemas';
import { API_ERROR_CODES } from '@/types/api';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

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
    throw new ApiError(404, 'Not found');
  }

  return json(result.rows[0]);
});

export const PUT = withApiHandler(async (request, { params }) => {
  const id = parseIdParam(params.id);

  const existing = await sql`SELECT id FROM customers WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  const body = await parseJsonBody(request);
  const parsed = parseSchema(CustomerSchema, body);

  const { first_name, last_name, phone, email, lead_source_id, questionnaire_data } = parsed;

  const result = await sql`
    UPDATE customers
    SET
      first_name = ${first_name},
      last_name = ${last_name},
      phone = ${asSqlString(phone)},
      email = ${asSqlString(email)},
      lead_source_id = ${lead_source_id ?? null},
      questionnaire_data = ${JSON.stringify(questionnaire_data ?? {})}::jsonb,
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, first_name, last_name, phone, email, lead_source_id, questionnaire_data, created_at, updated_at
  `;

  return json(result.rows[0]);
});

export const DELETE = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const existing = await sql`SELECT id FROM customers WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  const inUse = await sql`
    SELECT 1 FROM income_entries WHERE customer_id = ${id} LIMIT 1
  `;

  if (inUse.rows.length > 0) {
    throw new ApiError(409, 'Cannot delete: customer has linked income entries', {
      code: API_ERROR_CODES.IN_USE,
    });
  }

  await sql`DELETE FROM customers WHERE id = ${id}`;

  return new Response(null, { status: 204 });
});
