import { sql } from '@/lib/db';
import { ApiError, json, parseIdParam, parseJsonBody, parseSchema, withApiHandler } from '@/lib/http';
import { LeadEventSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (_request, { params }) => {
  const leadId = parseIdParam(params.id);

  const exists = await sql`SELECT id FROM leads WHERE id = ${leadId} LIMIT 1`;
  if (exists.rows.length === 0) throw new ApiError(404, 'Not found');

  const result = await sql`
    SELECT id, lead_id, type, payload, created_at
    FROM lead_events
    WHERE lead_id = ${leadId}
    ORDER BY created_at ASC, id ASC
  `;

  return json(result.rows);
});

export const POST = withApiHandler(async (request, { params }) => {
  const leadId = parseIdParam(params.id);

  const body = await parseJsonBody(request);
  const ev = parseSchema(LeadEventSchema, { ...(body as object), lead_id: leadId });

  const exists = await sql`SELECT id FROM leads WHERE id = ${leadId} LIMIT 1`;
  if (exists.rows.length === 0) throw new ApiError(404, 'Not found');

  const insert = await sql`
    INSERT INTO lead_events (lead_id, type, payload)
    VALUES (${leadId}, ${ev.type}, ${JSON.stringify(ev.payload ?? {})}::jsonb)
    RETURNING id, lead_id, type, payload, created_at
  `;

  return json(insert.rows[0], 201);
});
