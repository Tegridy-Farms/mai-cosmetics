import { sql } from '@/lib/db';
import { json, parseIdParam, withApiHandler } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const result = await sql`
    SELECT
      COUNT(*)::int AS total_sessions,
      COALESCE(SUM(amount), 0)::float AS total_revenue
    FROM income_entries
    WHERE customer_id = ${id}
  `;

  if (result.rows.length === 0) {
    return json({ total_sessions: 0, total_revenue: 0 });
  }

  return json(result.rows[0]);
});
