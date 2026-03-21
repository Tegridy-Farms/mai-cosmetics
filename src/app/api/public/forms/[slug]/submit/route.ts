import { sql } from '@/lib/db';
import { ApiError, json, parseJsonBody, parseSchema, withApiHandler } from '@/lib/http';
import { asSqlString } from '@/lib/sql-primitive';
import { PublicLeadSubmitSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

function getClientIp(request: Request): string | undefined {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim();
  return request.headers.get('x-real-ip') ?? undefined;
}

function deriveSourceChannel(input?: string): 'instagram' | 'facebook' | 'referral' | 'other' {
  const s = (input ?? '').toLowerCase();
  if (s.includes('insta')) return 'instagram';
  if (s.includes('facebook') || s.includes('fb')) return 'facebook';
  if (s.includes('ref')) return 'referral';
  return 'other';
}

const rateState: Map<string, { count: number; resetAt: number }> = new Map();
function rateLimit(key: string, maxPerMinute: number): boolean {
  const now = Date.now();
  const entry = rateState.get(key);
  if (!entry || entry.resetAt <= now) {
    rateState.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= maxPerMinute) return false;
  entry.count += 1;
  return true;
}

export const POST = withApiHandler(async (request, { params }) => {
  const slug = typeof params.slug === 'string' ? params.slug : params.slug?.[0];
  if (!slug) throw new ApiError(400, 'Invalid slug');

  const formResult = await sql`
    SELECT id, campaign_id, status
    FROM forms
    WHERE slug = ${slug}
    LIMIT 1
  `;
  const form = formResult.rows[0] as
    | { id: number; campaign_id: number | null; status: string }
    | undefined;
  if (!form || form.status !== 'published') throw new ApiError(404, 'Not found');

  const body = await parseJsonBody(request);
  const data = parseSchema(PublicLeadSubmitSchema, body);

  if (data.honeypot && data.honeypot.trim().length > 0) {
    return json({ ok: true }, 200);
  }

  if (typeof data.started_at_ms === 'number') {
    const delta = Date.now() - data.started_at_ms;
    if (delta >= 0 && delta < 1200) return json({ ok: true }, 200);
  }

  const ip = getClientIp(request) ?? 'unknown';
  const ua = request.headers.get('user-agent') ?? undefined;
  const rateKey = `${ip}::${ua ?? ''}`;
  if (!rateLimit(rateKey, 12)) {
    throw new ApiError(429, 'Too many requests');
  }

  const source_channel = data.source_channel ?? deriveSourceChannel(data.utm_source);

  const attribution = {
    utm_source: data.utm_source,
    utm_medium: data.utm_medium,
    utm_campaign: data.utm_campaign,
    utm_content: data.utm_content,
    utm_term: data.utm_term,
    referrer: data.referrer,
    landing_path: data.landing_path,
    user_agent: ua,
    ip,
  };

  const leadInsert = await sql`
    INSERT INTO leads (
      form_id,
      campaign_id,
      source_channel,
      full_name,
      phone,
      email,
      consent_marketing,
      stage,
      attribution,
      submitted_at
    )
    VALUES (
      ${form.id},
      ${form.campaign_id},
      ${source_channel},
      ${data.full_name},
      ${asSqlString(data.phone)},
      ${asSqlString(data.email)},
      ${data.consent_marketing ?? false},
      'new',
      ${JSON.stringify(attribution)}::jsonb,
      NOW()
    )
    RETURNING id
  `;

  const leadId = (leadInsert.rows[0] as { id: number }).id;

  await sql`
    INSERT INTO lead_events (lead_id, type, payload)
    VALUES (${leadId}, 'stage_change', ${JSON.stringify({ from: null, to: 'new' })}::jsonb)
  `;

  return json({ ok: true, lead_id: leadId }, 201);
});
