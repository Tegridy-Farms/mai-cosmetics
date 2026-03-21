import { sql } from '@/lib/db';
import { ApiError, json, parseIdParam, parseJsonBody, parseSchema, withApiHandler } from '@/lib/http';
import { asSqlString } from '@/lib/sql-primitive';
import { CampaignSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const result = await sql`
    SELECT id, name, slug, channel_focus, start_date, end_date, budget, notes, created_at
    FROM campaigns
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
  const data = parseSchema(CampaignSchema, body);

  const { name, slug, channel_focus, start_date, end_date, budget, notes } = data;

  const result = await sql`
    UPDATE campaigns
    SET
      name = ${name},
      slug = ${slug},
      channel_focus = ${channel_focus},
      start_date = ${start_date ?? null},
      end_date = ${end_date ?? null},
      budget = ${budget ?? null},
      notes = ${asSqlString(notes)}
    WHERE id = ${id}
    RETURNING id, name, slug, channel_focus, start_date, end_date, budget, notes, created_at
  `;

  const row = result.rows[0];
  if (!row) throw new ApiError(404, 'Not found');
  return json(row);
});

export const DELETE = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const result = await sql`
    DELETE FROM campaigns
    WHERE id = ${id}
    RETURNING id
  `;
  const row = result.rows[0];
  if (!row) throw new ApiError(404, 'Not found');
  return json({ ok: true });
});
