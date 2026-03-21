import { z } from 'zod';

export const DashboardQuerySchema = z.object({
  period: z.enum(['month', 'all']).default('month'),
});
