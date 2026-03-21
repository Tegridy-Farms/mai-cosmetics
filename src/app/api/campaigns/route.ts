import { sql } from '@/lib/db';
import { json, parseJsonBody, parseSchema, withApiHandlerNoParams } from '@/lib/http';
import { asSqlString } from '@/lib/sql-primitive';
import { CampaignSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export const GET = withApiHandlerNoParams(async () => {
  const result = await sql`
    SELECT id, name, slug, channel_focus, start_date, end_date, budget, notes, created_at
    FROM campaigns
    ORDER BY created_at DESC, id DESC
  `;
  return json(result.rows);
});

export const POST = withApiHandlerNoParams(async (request) => {
  const body = await parseJsonBody(request);
  const data = parseSchema(CampaignSchema, body);

  const { name, slug, channel_focus, start_date, end_date, budget, notes } = data;

  const result = await sql`
    INSERT INTO campaigns (name, slug, channel_focus, start_date, end_date, budget, notes)
    VALUES (
      ${name},
      ${slug},
      ${channel_focus},
      ${start_date ?? null},
      ${end_date ?? null},
      ${budget ?? null},
      ${asSqlString(notes)}
    )
    RETURNING id, name, slug, channel_focus, start_date, end_date, budget, notes, created_at
  `;

  return json(result.rows[0], 201);
});
