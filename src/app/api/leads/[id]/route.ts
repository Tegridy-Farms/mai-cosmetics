import { sql } from '@/lib/db';
import { ApiError, json, parseIdParam, parseJsonBody, parseSchema, withApiHandler } from '@/lib/http';
import { asSqlString } from '@/lib/sql-primitive';
import { LeadSchema, LeadStageSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const result = await sql`
    SELECT
      l.id,
      l.form_id,
      l.campaign_id,
      l.source_channel,
      l.full_name,
      l.phone,
      l.email,
      l.consent_marketing,
      l.stage,
      l.lost_reason,
      l.converted_customer_id,
      l.attribution,
      l.submitted_at,
      l.created_at,
      l.updated_at,
      f.name AS form_name,
      c.name AS campaign_name
    FROM leads l
    LEFT JOIN forms f ON f.id = l.form_id
    LEFT JOIN campaigns c ON c.id = l.campaign_id
    WHERE l.id = ${id}
    LIMIT 1
  `;
  const row = result.rows[0];
  if (!row) throw new ApiError(404, 'Not found');
  return json(row);
});

export const PUT = withApiHandler(async (request, { params }) => {
  const id = parseIdParam(params.id);

  const body = await parseJsonBody(request);
  const patch = parseSchema(LeadSchema.partial(), body);

  const currentResult = await sql`SELECT stage FROM leads WHERE id = ${id} LIMIT 1`;
  const current = currentResult.rows[0] as { stage: string } | undefined;
  if (!current) throw new ApiError(404, 'Not found');

  const nextStage = patch.stage;
  if (nextStage) {
    const stageParsed = LeadStageSchema.safeParse(nextStage);
    if (!stageParsed.success) throw new ApiError(400, 'Invalid stage');
  }

  const updated = await sql`
    UPDATE leads
    SET
      form_id = COALESCE(${patch.form_id ?? null}, form_id),
      campaign_id = COALESCE(${patch.campaign_id ?? null}, campaign_id),
      source_channel = COALESCE(${patch.source_channel ?? null}, source_channel),
      full_name = COALESCE(${patch.full_name ?? null}, full_name),
      phone = COALESCE(${asSqlString(patch.phone)}, phone),
      email = COALESCE(${asSqlString(patch.email)}, email),
      consent_marketing = COALESCE(${patch.consent_marketing ?? null}, consent_marketing),
      stage = COALESCE(${patch.stage ?? null}, stage),
      lost_reason = COALESCE(${asSqlString(patch.lost_reason)}, lost_reason),
      converted_customer_id = COALESCE(${patch.converted_customer_id ?? null}, converted_customer_id),
      attribution = COALESCE(${patch.attribution ? JSON.stringify(patch.attribution) : null}::jsonb, attribution),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, stage
  `;
  const updatedRow = updated.rows[0] as { id: number; stage: string } | undefined;
  if (!updatedRow) throw new ApiError(404, 'Not found');

  if (nextStage && nextStage !== current.stage) {
    await sql`
      INSERT INTO lead_events (lead_id, type, payload)
      VALUES (${id}, 'stage_change', ${JSON.stringify({ from: current.stage, to: nextStage })}::jsonb)
    `;
  }

  const result = await sql`
    SELECT id, form_id, campaign_id, source_channel, full_name, phone, email, consent_marketing, stage, lost_reason,
           converted_customer_id, attribution, submitted_at, created_at, updated_at
    FROM leads
    WHERE id = ${id}
    LIMIT 1
  `;

  return json(result.rows[0]);
});

export const DELETE = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const result = await sql`
    DELETE FROM leads
    WHERE id = ${id}
    RETURNING id
  `;
  const row = result.rows[0];
  if (!row) throw new ApiError(404, 'Not found');
  return json({ ok: true });
});
