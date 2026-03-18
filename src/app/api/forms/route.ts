import { sql } from '@/lib/db';
import { FormSchema } from '@/lib/schemas';

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
      SELECT id, campaign_id, name, slug, status, ui_schema, created_at, updated_at
      FROM forms
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
    const parsed = FormSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse({ error: 'Validation failed', details: parsed.error.issues }, 400);
    }

    const { campaign_id, name, slug, status, ui_schema } = parsed.data;

    const result = await sql`
      INSERT INTO forms (campaign_id, name, slug, status, ui_schema)
      VALUES (
        ${campaign_id ?? null},
        ${name},
        ${slug},
        ${status},
        ${JSON.stringify(ui_schema ?? {})}::jsonb
      )
      RETURNING id, campaign_id, name, slug, status, ui_schema, created_at, updated_at
    `;

    return jsonResponse(result.rows[0], 201);
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

