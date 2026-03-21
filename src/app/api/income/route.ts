import { query, sql } from '@/lib/db';
import { json, parseJsonBody, parseSchema, parseSearchParams, withApiHandlerNoParams } from '@/lib/http';
import { assertAppliedAddonsAllowed } from '@/lib/income-applied-addons';
import { IncomeEntrySchema, IncomeQuerySchema } from '@/lib/schemas';
import type { IncomeEntry } from '@/types';

export const POST = withApiHandlerNoParams(async (request) => {
  const body = await parseJsonBody(request);
  const parsed = parseSchema(IncomeEntrySchema, body);

  const {
    service_name,
    service_type_id,
    customer_id,
    date,
    duration_minutes,
    amount,
    applied_addon_ids: appliedAddonIdsRaw,
    comment,
  } = parsed;

  const applied_addon_ids: number[] = Array.isArray(appliedAddonIdsRaw)
    ? appliedAddonIdsRaw
    : [];

  await assertAppliedAddonsAllowed(service_type_id, applied_addon_ids);

  const rows = await query<Record<string, unknown>>(
    `INSERT INTO income_entries (service_name, service_type_id, customer_id, date, duration_minutes, amount, comment, applied_addon_ids)
     VALUES ($1, $2, $3, $4::date, $5, $6, $7, $8::int4[])
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
    ]
  );

  return json(rows[0], 201);
});

export const GET = withApiHandlerNoParams(async (request) => {
  const q = parseSearchParams(IncomeQuerySchema, request, 'Invalid query parameters');
  const page = q.page ?? 1;
  const pageSize = q.page_size ?? 20;
  const { service_type_id, customer_id, date_from, date_to } = q;
  const offset = (page - 1) * pageSize;

  const [countResult, dataResult] = await Promise.all([
    sql`
      SELECT COUNT(*) AS total
      FROM income_entries
      WHERE (${service_type_id ?? null}::int IS NULL OR service_type_id = ${service_type_id ?? null})
        AND (${customer_id ?? null}::int IS NULL OR customer_id = ${customer_id ?? null})
        AND (${date_from ?? null}::date IS NULL OR date >= ${date_from ?? null})
        AND (${date_to ?? null}::date IS NULL OR date <= ${date_to ?? null})
    `,
    sql`
      SELECT id, service_name, service_type_id, customer_id, date::text AS date, duration_minutes, amount, comment, applied_addon_ids, created_at
      FROM income_entries
      WHERE (${service_type_id ?? null}::int IS NULL OR service_type_id = ${service_type_id ?? null})
        AND (${customer_id ?? null}::int IS NULL OR customer_id = ${customer_id ?? null})
        AND (${date_from ?? null}::date IS NULL OR date >= ${date_from ?? null})
        AND (${date_to ?? null}::date IS NULL OR date <= ${date_to ?? null})
      ORDER BY date DESC, id DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `,
  ]);

  const total = parseInt((countResult.rows[0] as { total: string }).total, 10);
  const data = dataResult.rows as IncomeEntry[];

  return json({ data, total, page, pageSize });
});
