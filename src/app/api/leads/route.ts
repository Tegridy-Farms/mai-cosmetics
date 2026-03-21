import { sql } from '@/lib/db';
import { json, parseJsonBody, parseSchema, parseSearchParams, withApiHandlerNoParams } from '@/lib/http';
import { asSqlString } from '@/lib/sql-primitive';
import { LeadQuerySchema, LeadSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export const GET = withApiHandlerNoParams(async (request) => {
  const parsed = parseSearchParams(LeadQuerySchema, request);

  const page = parsed.page ?? 1;
  const {
    page_size,
    search,
    stage,
    campaign_id,
    form_id,
    source_channel,
    date_from,
    date_to,
  } = parsed;

  const pageSize = page_size ?? 20;
  const offset = (page - 1) * pageSize;

  const whereParts: string[] = [];
  const params: unknown[] = [];

  if (stage) {
    params.push(stage);
    whereParts.push(`l.stage = $${params.length}`);
  }
  if (campaign_id) {
    params.push(campaign_id);
    whereParts.push(`l.campaign_id = $${params.length}`);
  }
  if (form_id) {
    params.push(form_id);
    whereParts.push(`l.form_id = $${params.length}`);
  }
  if (source_channel) {
    params.push(source_channel);
    whereParts.push(`l.source_channel = $${params.length}`);
  }
  if (search && search.trim().length > 0) {
    params.push(`%${search.trim()}%`);
    whereParts.push(
      `(l.full_name ILIKE $${params.length} OR l.phone ILIKE $${params.length} OR l.email ILIKE $${params.length})`
    );
  }
  if (date_from) {
    params.push(date_from);
    whereParts.push(`l.submitted_at >= $${params.length}::date`);
  }
  if (date_to) {
    params.push(date_to);
    whereParts.push(`l.submitted_at <= ($${params.length}::date + interval '1 day')`);
  }

  const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

  const countRows = await sql.query(
    `
        SELECT COUNT(*)::int AS total
        FROM leads l
        ${whereClause}
      `,
    params
  );
  const total = (countRows.rows[0] as { total: number } | undefined)?.total ?? 0;

  params.push(pageSize);
  params.push(offset);

  const dataRows = await sql.query(
    `
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
        ${whereClause}
        ORDER BY l.submitted_at DESC, l.id DESC
        LIMIT $${params.length - 1}
        OFFSET $${params.length}
      `,
    params
  );

  return json({ data: dataRows.rows, total, page, pageSize });
});

export const POST = withApiHandlerNoParams(async (request) => {
  const body = await parseJsonBody(request);
  const lead = parseSchema(LeadSchema, body);

  const insert = await sql`
    INSERT INTO leads (
      form_id,
      campaign_id,
      source_channel,
      full_name,
      phone,
      email,
      consent_marketing,
      stage,
      lost_reason,
      converted_customer_id,
      attribution,
      submitted_at
    )
    VALUES (
      ${lead.form_id ?? null},
      ${lead.campaign_id ?? null},
      ${lead.source_channel},
      ${lead.full_name},
      ${asSqlString(lead.phone)},
      ${asSqlString(lead.email)},
      ${lead.consent_marketing ?? false},
      ${lead.stage ?? 'new'},
      ${asSqlString(lead.lost_reason)},
      ${lead.converted_customer_id ?? null},
      ${JSON.stringify(lead.attribution ?? {})}::jsonb,
      NOW()
    )
    RETURNING id
  `;

  const leadId = (insert.rows[0] as { id: number }).id;

  await sql`
    INSERT INTO lead_events (lead_id, type, payload)
    VALUES (${leadId}, 'stage_change', ${JSON.stringify({ from: null, to: lead.stage ?? 'new' })}::jsonb)
  `;

  const result = await sql`
    SELECT id, form_id, campaign_id, source_channel, full_name, phone, email, consent_marketing, stage, lost_reason,
           converted_customer_id, attribution, submitted_at, created_at, updated_at
    FROM leads
    WHERE id = ${leadId}
    LIMIT 1
  `;

  return json(result.rows[0], 201);
});
