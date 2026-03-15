import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(): Promise<Response> {
  try {
    const result = await sql`SELECT id, name FROM service_types ORDER BY name ASC`;
    return jsonResponse(result.rows);
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
