import { sql } from '@/lib/db';
import { ServiceTypeSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(): Promise<Response> {
  try {
    const result = await sql`SELECT id, name, default_price, default_duration, created_at FROM service_types ORDER BY name ASC`;
    return jsonResponse(result.rows);
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = ServiceTypeSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse({ error: 'Validation failed', details: parsed.error.issues }, 400);
    }

    const { name, default_price, default_duration } = parsed.data;

    const result = await sql`
      INSERT INTO service_types (name, default_price, default_duration)
      VALUES (${name}, ${default_price ?? null}, ${default_duration ?? null})
      RETURNING id, name, default_price, default_duration, created_at
    `;

    return jsonResponse(result.rows[0], 201);
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
