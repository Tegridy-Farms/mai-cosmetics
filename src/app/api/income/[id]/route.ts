import { query, sql } from '@/lib/db';
import { ApiError, json, parseIdParam, parseJsonBody, parseSchema, withApiHandler } from '@/lib/http';
import { assertAppliedAddonsAllowed } from '@/lib/income-applied-addons';
import { IncomeEntrySchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const result = await sql`
    SELECT id, service_name, service_type_id, customer_id, date::text AS date, duration_minutes, amount, comment, applied_addon_ids, created_at
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

  const {
    service_name,
    service_type_id,
    customer_id,
    date,
    duration_minutes,
    amount,
    applied_addon_ids: appliedAddonIdsRaw,
    comment,
  } = data;

  const applied_addon_ids: number[] = Array.isArray(appliedAddonIdsRaw)
    ? appliedAddonIdsRaw
    : [];

  await assertAppliedAddonsAllowed(service_type_id, applied_addon_ids);

  const rows = await query<Record<string, unknown>>(
    `UPDATE income_entries
     SET service_name = $1, service_type_id = $2,
         customer_id = $3, date = $4::date,
         duration_minutes = $5, amount = $6, comment = $7,
         applied_addon_ids = $8::int4[]
     WHERE id = $9
     RETURNING id, service_name, service_type_id, customer_id, date::text AS date, duration_minutes, amount, comment, applied_addon_ids, created_at`,
    [
      service_name,
      service_type_id,
      customer_id ?? null,
      date,
      duration_minutes,
      amount,
      comment,
      applied_addon_ids,
      id,
    ]
  );

  return json(rows[0]);
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
