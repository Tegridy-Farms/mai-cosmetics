import { sql } from '@/lib/db';
import { json, parseJsonBody, parseSchema, withApiHandlerNoParams } from '@/lib/http';
import { FormSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export const GET = withApiHandlerNoParams(async () => {
  const result = await sql`
    SELECT id, campaign_id, name, slug, status, ui_schema, created_at, updated_at
    FROM forms
    ORDER BY created_at DESC, id DESC
  `;
  return json(result.rows);
});

export const POST = withApiHandlerNoParams(async (request) => {
  const body = await parseJsonBody(request);
  const data = parseSchema(FormSchema, body);

  const { campaign_id, name, slug, status, ui_schema } = data;

  const result = await sql`
    INSERT INTO forms (campaign_id, name, slug, status, ui_schema)
    VALUES (
      ${campaign_id ?? null},
      ${name},
      ${slug},
      ${status},
      ${JSON.stringify(ui_schema ?? {})}::jsonb
    )
    RETURNING id, campaign_id, name, slug, status, ui_schema, created_at, updated_at
  `;

  return json(result.rows[0], 201);
});
