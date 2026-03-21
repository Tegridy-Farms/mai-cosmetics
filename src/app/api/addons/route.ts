import { query, sql } from '@/lib/db';
import {
  json,
  parseJsonBody,
  parseSchema,
  parseSearchParams,
  rethrowAsApiErrorIfPostgres,
  withApiHandlerNoParams,
} from '@/lib/http';
import { AddonCreateSchema, AddonListQuerySchema } from '@/lib/schemas';
import { assertServiceTypesExist } from '@/lib/addon-service-type-ids';
import { ApiError } from '@/lib/http/api-error';

export const dynamic = 'force-dynamic';

export const GET = withApiHandlerNoParams(async (request) => {
  const q = parseSearchParams(AddonListQuerySchema, request, 'Invalid query parameters');

  if (q.service_type_id != null) {
    const result = await sql`
      SELECT id, name, price, service_type_ids, sort_order, created_at
      FROM addons
      WHERE ${q.service_type_id} = ANY(service_type_ids)
      ORDER BY sort_order ASC, name ASC
    `;
    return json(result.rows);
  }

  const result = await sql`
    SELECT id, name, price, service_type_ids, sort_order, created_at
    FROM addons
    ORDER BY sort_order ASC, name ASC
  `;
  return json(result.rows);
});

export const POST = withApiHandlerNoParams(async (request) => {
  const body = await parseJsonBody(request);
  const data = parseSchema(AddonCreateSchema, body);

  const ok = await assertServiceTypesExist(data.service_type_ids ?? []);
  if (!ok) {
    throw new ApiError(400, 'Invalid service type ids');
  }

  const stIds = data.service_type_ids ?? [];

  try {
    const rows = await query<Record<string, unknown>>(
      `INSERT INTO addons (name, price, service_type_ids, sort_order)
       VALUES ($1, $2, $3::int4[], (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM addons))
       RETURNING id, name, price, service_type_ids, sort_order, created_at`,
      [data.name, data.price, stIds]
    );
    return json(rows[0], 201);
  } catch (e) {
    rethrowAsApiErrorIfPostgres(e);
  }
});
