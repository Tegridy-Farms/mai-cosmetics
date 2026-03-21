import { z } from 'zod';

export const AddonCreateSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  price: z.number().positive(),
  service_type_ids: z.array(z.number().int().positive()).default([]),
});

export const AddonUpdateSchema = AddonCreateSchema;

export const AddonListQuerySchema = z.object({
  service_type_id: z.coerce.number().int().positive().optional(),
});

export type AddonCreateInput = z.infer<typeof AddonCreateSchema>;
