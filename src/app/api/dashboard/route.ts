import { getDashboardMetrics, getServiceTypeMetrics } from '@/lib/calculations';
import { json, parseSearchParams, withApiHandlerNoParams } from '@/lib/http';
import { DashboardQuerySchema } from '@/lib/schemas';

export const GET = withApiHandlerNoParams(async (request) => {
  const q = parseSearchParams(DashboardQuerySchema, request, 'Invalid query parameters');
  const period = q.period ?? 'month';

  const [metrics, serviceTypes] = await Promise.all([
    getDashboardMetrics(period),
    getServiceTypeMetrics(period),
  ]);

  return json({
    ...metrics,
    by_service_type: serviceTypes,
  });
});
