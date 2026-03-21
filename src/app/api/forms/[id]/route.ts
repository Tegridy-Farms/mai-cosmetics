import { sql } from '@/lib/db';
import { ApiError, json, parseIdParam, parseJsonBody, parseSchema, withApiHandler } from '@/lib/http';
import { FormSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const result = await sql`
    SELECT id, campaign_id, name, slug, status, ui_schema, created_at, updated_at
    FROM forms
    WHERE id = ${id}
    LIMIT 1
  `;
  const row = result.rows[0];
  if (!row) throw new ApiError(404, 'Not found');
  return json(row);
});

export const PUT = withApiHandler(async (request, { params }) => {
  const id = parseIdParam(params.id);

  const body = await parseJsonBody(request);
  const data = parseSchema(FormSchema, body);

  const { campaign_id, name, slug, status, ui_schema } = data;

  const result = await sql`
    UPDATE forms
    SET
      campaign_id = ${campaign_id ?? null},
      name = ${name},
      slug = ${slug},
      status = ${status},
      ui_schema = ${JSON.stringify(ui_schema ?? {})}::jsonb,
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, campaign_id, name, slug, status, ui_schema, created_at, updated_at
  `;
  const row = result.rows[0];
  if (!row) throw new ApiError(404, 'Not found');
  return json(row);
});

export const DELETE = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const result = await sql`
    DELETE FROM forms
    WHERE id = ${id}
    RETURNING id
  `;
  const row = result.rows[0];
  if (!row) throw new ApiError(404, 'Not found');
  return json({ ok: true });
});
