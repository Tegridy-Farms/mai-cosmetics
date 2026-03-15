import { getDashboardMetrics, getServiceTypeMetrics } from '@/lib/calculations';
import { DashboardQuerySchema } from '@/lib/schemas';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());

    const parsed = DashboardQuerySchema.safeParse(params);
    if (!parsed.success) {
      return jsonResponse({ error: 'Invalid query parameters', details: parsed.error.issues }, 400);
    }

    const { period } = parsed.data;

    const [metrics, serviceTypes] = await Promise.all([
      getDashboardMetrics(period),
      getServiceTypeMetrics(period),
    ]);

    return jsonResponse({
      ...metrics,
      by_service_type: serviceTypes,
    });
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
