import { sql } from '@/lib/db';
import { FormSchema } from '@/lib/schemas';

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
      SELECT id, campaign_id, name, slug, status, ui_schema, created_at, updated_at
      FROM forms
      WHERE id = ${id}
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
    const parsed = FormSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse({ error: 'Validation failed', details: parsed.error.issues }, 400);
    }

    const { campaign_id, name, slug, status, ui_schema } = parsed.data;

    const result = await sql`
      UPDATE forms
      SET
        campaign_id = ${campaign_id ?? null},
        name = ${name},
        slug = ${slug},
        status = ${status},
        ui_schema = ${JSON.stringify(ui_schema ?? {})}::jsonb,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, campaign_id, name, slug, status, ui_schema, created_at, updated_at
    `;
    const row = result.rows[0];
    if (!row) return jsonResponse({ error: 'Not found' }, 404);
    return jsonResponse(row);
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return jsonResponse({ error: 'Invalid id' }, 400);

    const result = await sql`
      DELETE FROM forms
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

