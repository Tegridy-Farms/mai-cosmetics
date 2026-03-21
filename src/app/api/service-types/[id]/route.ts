import { sql } from '@/lib/db';
import { ApiError, json, parseIdParam, parseJsonBody, parseSchema, withApiHandler } from '@/lib/http';
import { ServiceTypeSchema } from '@/lib/schemas';
import { API_ERROR_CODES } from '@/types/api';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const result = await sql`
    SELECT id, name, default_price, default_duration, sort_order, created_at FROM service_types WHERE id = ${id}
  `;

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  return json(result.rows[0]);
});

export const PUT = withApiHandler(async (request, { params }) => {
  const id = parseIdParam(params.id);

  const existing = await sql`SELECT id FROM service_types WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  const body = await parseJsonBody(request);
  const data = parseSchema(ServiceTypeSchema, body);

  const { name, default_price, default_duration } = data;

  const result = await sql`
    UPDATE service_types SET name = ${name}, default_price = ${default_price ?? null}, default_duration = ${default_duration ?? null}
    WHERE id = ${id}
    RETURNING id, name, default_price, default_duration, sort_order, created_at
  `;

  return json(result.rows[0]);
});

export const DELETE = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const existing = await sql`SELECT id FROM service_types WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  const inUse = await sql`
    SELECT 1 FROM income_entries WHERE service_type_id = ${id} LIMIT 1
  `;

  if (inUse.rows.length > 0) {
    throw new ApiError(409, 'Cannot delete: service type is in use', {
      code: API_ERROR_CODES.IN_USE,
    });
  }

  await sql`DELETE FROM service_types WHERE id = ${id}`;

  return new Response(null, { status: 204 });
});
