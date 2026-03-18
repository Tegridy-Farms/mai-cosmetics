import { sql } from '@/lib/db';
import { LeadSchema, LeadStageSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(_: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return jsonResponse({ error: 'Invalid id' }, 400);

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
    if (!row) return jsonResponse({ error: 'Not found' }, 404);
    return jsonResponse(row);
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return jsonResponse({ error: 'Invalid id' }, 400);

    const body = await request.json();
    const parsed = LeadSchema.partial().safeParse(body);
    if (!parsed.success) {
      return jsonResponse({ error: 'Validation failed', details: parsed.error.issues }, 400);
    }

    const currentResult = await sql`SELECT stage FROM leads WHERE id = ${id} LIMIT 1`;
    const current = currentResult.rows[0] as { stage: string } | undefined;
    if (!current) return jsonResponse({ error: 'Not found' }, 404);

    const nextStage = parsed.data.stage;
    if (nextStage) {
      const stageParsed = LeadStageSchema.safeParse(nextStage);
      if (!stageParsed.success) return jsonResponse({ error: 'Invalid stage' }, 400);
    }

    const updated = await sql`
      UPDATE leads
      SET
        form_id = COALESCE(${parsed.data.form_id ?? null}, form_id),
        campaign_id = COALESCE(${parsed.data.campaign_id ?? null}, campaign_id),
        source_channel = COALESCE(${parsed.data.source_channel ?? null}, source_channel),
        full_name = COALESCE(${parsed.data.full_name ?? null}, full_name),
        phone = COALESCE(${parsed.data.phone ?? null}, phone),
        email = COALESCE(${parsed.data.email ?? null}, email),
        consent_marketing = COALESCE(${parsed.data.consent_marketing ?? null}, consent_marketing),
        stage = COALESCE(${parsed.data.stage ?? null}, stage),
        lost_reason = COALESCE(${parsed.data.lost_reason ?? null}, lost_reason),
        converted_customer_id = COALESCE(${parsed.data.converted_customer_id ?? null}, converted_customer_id),
        attribution = COALESCE(${parsed.data.attribution ? JSON.stringify(parsed.data.attribution) : null}::jsonb, attribution),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, stage
    `;
    const updatedRow = updated.rows[0] as { id: number; stage: string } | undefined;
    if (!updatedRow) return jsonResponse({ error: 'Not found' }, 404);

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

    return jsonResponse(result.rows[0]);
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return jsonResponse({ error: 'Invalid id' }, 400);

    const result = await sql`
      DELETE FROM leads
      WHERE id = ${id}
      RETURNING id
    `;
    const row = result.rows[0];
    if (!row) return jsonResponse({ error: 'Not found' }, 404);
    return jsonResponse({ ok: true });
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

