import { getTrendData } from '@/lib/calculations';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(_request: Request): Promise<Response> {
  try {
    const months = await getTrendData();
    return jsonResponse({ months });
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
