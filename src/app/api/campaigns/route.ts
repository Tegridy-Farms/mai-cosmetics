import { sql } from '@/lib/db';
import { CampaignSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(): Promise<Response> {
  try {
    const result = await sql`
      SELECT id, name, slug, channel_focus, start_date, end_date, budget, notes, created_at
      FROM campaigns
      ORDER BY created_at DESC, id DESC
    `;
    return jsonResponse(result.rows);
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = CampaignSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse({ error: 'Validation failed', details: parsed.error.issues }, 400);
    }

    const { name, slug, channel_focus, start_date, end_date, budget, notes } = parsed.data;

    const result = await sql`
      INSERT INTO campaigns (name, slug, channel_focus, start_date, end_date, budget, notes)
      VALUES (
        ${name},
        ${slug},
        ${channel_focus},
        ${start_date ?? null},
        ${end_date ?? null},
        ${budget ?? null},
        ${notes ?? null}
      )
      RETURNING id, name, slug, channel_focus, start_date, end_date, budget, notes, created_at
    `;

    return jsonResponse(result.rows[0], 201);
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

