import { z } from 'zod';

export const LeadSourceSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  sort_order: z.number().int().nonnegative().optional().default(0),
});
