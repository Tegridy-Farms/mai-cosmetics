import { sql } from '@/lib/db';
import { json, parseJsonBody, parseSchema, withApiHandlerNoParams } from '@/lib/http';
import { ServiceTypeSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export const GET = withApiHandlerNoParams(async () => {
  const result =
    await sql`SELECT id, name, default_price, default_duration, created_at FROM service_types ORDER BY name ASC`;
  return json(result.rows);
});

export const POST = withApiHandlerNoParams(async (request) => {
  const body = await parseJsonBody(request);
  const data = parseSchema(ServiceTypeSchema, body);

  const { name, default_price, default_duration } = data;

  const result = await sql`
    INSERT INTO service_types (name, default_price, default_duration)
    VALUES (${name}, ${default_price ?? null}, ${default_duration ?? null})
    RETURNING id, name, default_price, default_duration, created_at
  `;

  return json(result.rows[0], 201);
});
