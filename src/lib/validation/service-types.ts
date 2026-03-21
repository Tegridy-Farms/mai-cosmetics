import { z } from 'zod';

export const ServiceTypeSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  default_price: z.union([z.number().nonnegative(), z.null()]).optional(),
  default_duration: z.union([z.number().int().positive(), z.null()]).optional(),
});
