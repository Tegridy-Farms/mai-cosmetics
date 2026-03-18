import { sql } from '@/lib/db';
import { LeadEventSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(_: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const leadId = Number(params.id);
    if (!Number.isFinite(leadId)) return jsonResponse({ error: 'Invalid id' }, 400);

    const exists = await sql`SELECT id FROM leads WHERE id = ${leadId} LIMIT 1`;
    if (exists.rows.length === 0) return jsonResponse({ error: 'Not found' }, 404);

    const result = await sql`
      SELECT id, lead_id, type, payload, created_at
      FROM lead_events
      WHERE lead_id = ${leadId}
      ORDER BY created_at DESC, id DESC
    `;

    return jsonResponse(result.rows);
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const leadId = Number(params.id);
    if (!Number.isFinite(leadId)) return jsonResponse({ error: 'Invalid id' }, 400);

    const body = await request.json();
    const parsed = LeadEventSchema.safeParse({ ...body, lead_id: leadId });
    if (!parsed.success) {
      return jsonResponse({ error: 'Validation failed', details: parsed.error.issues }, 400);
    }

    const exists = await sql`SELECT id FROM leads WHERE id = ${leadId} LIMIT 1`;
    if (exists.rows.length === 0) return jsonResponse({ error: 'Not found' }, 404);

    const ev = parsed.data;
    const insert = await sql`
      INSERT INTO lead_events (lead_id, type, payload)
      VALUES (${leadId}, ${ev.type}, ${JSON.stringify(ev.payload ?? {})}::jsonb)
      RETURNING id, lead_id, type, payload, created_at
    `;

    return jsonResponse(insert.rows[0], 201);
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

