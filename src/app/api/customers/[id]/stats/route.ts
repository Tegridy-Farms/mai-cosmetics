import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return jsonResponse({ error: 'Invalid id' }, 400);
  }

  const result = await sql`
    SELECT
      COUNT(*)::int AS total_sessions,
      COALESCE(SUM(amount), 0)::float AS total_revenue
    FROM income_entries
    WHERE customer_id = ${id}
  `;

  if (result.rows.length === 0) {
    return jsonResponse({ total_sessions: 0, total_revenue: 0 });
  }

  return jsonResponse(result.rows[0]);
}
