import { sql } from '@/lib/db';
import { LeadSourceSchema } from '@/lib/schemas';

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
      SELECT id, name, sort_order, created_at FROM lead_sources ORDER BY sort_order ASC, name ASC
    `;
    return jsonResponse(result.rows);
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = LeadSourceSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse({ error: 'Validation failed', details: parsed.error.issues }, 400);
    }

    const { name, sort_order } = parsed.data;

    const result = await sql`
      INSERT INTO lead_sources (name, sort_order)
      VALUES (${name}, ${sort_order ?? 0})
      RETURNING id, name, sort_order, created_at
    `;

    return jsonResponse(result.rows[0], 201);
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
