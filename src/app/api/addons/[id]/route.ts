import { query, sql } from '@/lib/db';
import {
  ApiError,
  json,
  parseIdParam,
  parseJsonBody,
  parseSchema,
  rethrowAsApiErrorIfPostgres,
  withApiHandler,
} from '@/lib/http';
import { AddonUpdateSchema } from '@/lib/schemas';
import { assertServiceTypesExist } from '@/lib/addon-service-type-ids';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const result = await sql`
    SELECT id, name, price, service_type_ids, sort_order, created_at
    FROM addons
    WHERE id = ${id}
  `;

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  return json(result.rows[0]);
});

export const PUT = withApiHandler(async (request, { params }) => {
  const id = parseIdParam(params.id);

  const existing = await sql`SELECT id FROM addons WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  const body = await parseJsonBody(request);
  const data = parseSchema(AddonUpdateSchema, body);

  const ok = await assertServiceTypesExist(data.service_type_ids ?? []);
  if (!ok) {
    throw new ApiError(400, 'Invalid service type ids');
  }

  try {
    const rows = await query<Record<string, unknown>>(
      `UPDATE addons
       SET name = $1, price = $2, service_type_ids = $3::int4[]
       WHERE id = $4
       RETURNING id, name, price, service_type_ids, sort_order, created_at`,
      [data.name, data.price, data.service_type_ids, id]
    );
    return json(rows[0]);
  } catch (e) {
    rethrowAsApiErrorIfPostgres(e);
  }
});

export const DELETE = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const existing = await sql`SELECT id FROM addons WHERE id = ${id}`;

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  await sql`DELETE FROM addons WHERE id = ${id}`;

  return new Response(null, { status: 204 });
});
