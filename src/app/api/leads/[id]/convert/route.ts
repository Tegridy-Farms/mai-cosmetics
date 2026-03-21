import { sql } from '@/lib/db';
import { ApiError, json, parseIdParam, withApiHandler } from '@/lib/http';

export const dynamic = 'force-dynamic';

function splitName(fullName: string): { first_name: string; last_name: string } {
  const parts = fullName
    .split(' ')
    .map((p) => p.trim())
    .filter(Boolean);
  const first = parts[0] ?? fullName.trim() ?? '-';
  const last = parts.slice(1).join(' ').trim() || '-';
  return { first_name: first, last_name: last };
}

export const POST = withApiHandler(async (_request, { params }) => {
  const leadId = parseIdParam(params.id);

  const leadResult = await sql`
    SELECT id, full_name, phone, email, converted_customer_id, stage, attribution
    FROM leads
    WHERE id = ${leadId}
    LIMIT 1
  `;
  const lead = leadResult.rows[0] as
    | {
        id: number;
        full_name: string;
        phone: string | null;
        email: string | null;
        converted_customer_id: number | null;
        stage: string;
        attribution: Record<string, unknown> | null;
      }
    | undefined;

  if (!lead) throw new ApiError(404, 'Not found');
  if (lead.converted_customer_id) {
    return json({ ok: true, customer_id: lead.converted_customer_id, deduped: true });
  }

  const phone = lead.phone?.trim() || null;
  const email = lead.email?.trim() || null;

  let customerId: number | null = null;
  if (phone || email) {
    const existing = await sql`
      SELECT id
      FROM customers
      WHERE (${phone}::text IS NOT NULL AND phone = ${phone})
         OR (${email}::text IS NOT NULL AND email = ${email})
      ORDER BY id DESC
      LIMIT 1
    `;
    customerId = (existing.rows[0] as { id: number } | undefined)?.id ?? null;
  }

  let deduped = false;
  if (!customerId) {
    const { first_name, last_name } = splitName(lead.full_name);
    const questionnaire_data = {
      lead_id: lead.id,
      attribution: lead.attribution ?? {},
    };
    const inserted = await sql`
      INSERT INTO customers (first_name, last_name, phone, email, questionnaire_data)
      VALUES (${first_name}, ${last_name}, ${phone}, ${email}, ${JSON.stringify(questionnaire_data)}::jsonb)
      RETURNING id
    `;
    customerId = (inserted.rows[0] as { id: number }).id;
  } else {
    deduped = true;
  }

  const prevStage = lead.stage;
  await sql`
    UPDATE leads
    SET converted_customer_id = ${customerId}, stage = 'converted', updated_at = NOW()
    WHERE id = ${leadId}
  `;

  await sql`
    INSERT INTO lead_events (lead_id, type, payload)
    VALUES (${leadId}, 'conversion', ${JSON.stringify({ customer_id: customerId, deduped })}::jsonb)
  `;

  if (prevStage !== 'converted') {
    await sql`
      INSERT INTO lead_events (lead_id, type, payload)
      VALUES (${leadId}, 'stage_change', ${JSON.stringify({ from: prevStage, to: 'converted' })}::jsonb)
    `;
  }

  return json({ ok: true, customer_id: customerId, deduped }, 201);
});
