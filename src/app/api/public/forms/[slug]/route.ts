import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(_: Request, { params }: { params: { slug: string } }): Promise<Response> {
  try {
    const slug = params.slug;
    const result = await sql`
      SELECT id, campaign_id, name, slug, status, ui_schema, created_at, updated_at
      FROM forms
      WHERE slug = ${slug}
      LIMIT 1
    `;

    const form = result.rows[0];
    if (!form) return jsonResponse({ error: 'Not found' }, 404);

    if (form.status !== 'published') return jsonResponse({ error: 'Not found' }, 404);

    return jsonResponse(form);
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

