import { sql } from '@/lib/db';
import { ApiError, json, parseIdParam, parseJsonBody, parseSchema, withApiHandler } from '@/lib/http';
import { LeadSourceSchema } from '@/lib/schemas';
import { API_ERROR_CODES } from '@/types/api';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const result = await sql`
    SELECT id, name, sort_order, created_at FROM lead_sources WHERE id = ${id}
  `;

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  return json(result.rows[0]);
});

export const PUT = withApiHandler(async (request, { params }) => {
  const id = parseIdParam(params.id);

  const existing = await sql`SELECT id FROM lead_sources WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  const body = await parseJsonBody(request);
  const data = parseSchema(LeadSourceSchema, body);

  const { name, sort_order } = data;

  const result = await sql`
    UPDATE lead_sources SET name = ${name}, sort_order = ${sort_order ?? 0}
    WHERE id = ${id}
    RETURNING id, name, sort_order, created_at
  `;

  return json(result.rows[0]);
});

export const DELETE = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const existing = await sql`SELECT id FROM lead_sources WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  const inUse = await sql`
    SELECT 1 FROM customers WHERE lead_source_id = ${id} LIMIT 1
  `;

  if (inUse.rows.length > 0) {
    throw new ApiError(409, 'Cannot delete: lead source is in use by customers', {
      code: API_ERROR_CODES.IN_USE,
    });
  }

  await sql`DELETE FROM lead_sources WHERE id = ${id}`;

  return new Response(null, { status: 204 });
});
