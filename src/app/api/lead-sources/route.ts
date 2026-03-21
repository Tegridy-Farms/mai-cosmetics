import { sql } from '@/lib/db';
import { json, parseJsonBody, parseSchema, withApiHandlerNoParams } from '@/lib/http';
import { LeadSourceSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export const GET = withApiHandlerNoParams(async () => {
  const result = await sql`
    SELECT id, name, sort_order, created_at FROM lead_sources ORDER BY sort_order ASC, name ASC
  `;
  return json(result.rows);
});

export const POST = withApiHandlerNoParams(async (request) => {
  const body = await parseJsonBody(request);
  const data = parseSchema(LeadSourceSchema, body);

  const { name, sort_order } = data;

  const result = await sql`
    INSERT INTO lead_sources (name, sort_order)
    VALUES (${name}, ${sort_order ?? 0})
    RETURNING id, name, sort_order, created_at
  `;

  return json(result.rows[0], 201);
});
