import { z } from 'zod';

/** Body for `PUT .../reorder`: full permutation of row ids in display order (0-based sort_order assigned by index). */
export const ReorderBodySchema = z.object({
  ordered_ids: z.array(z.number().int().positive()),
});

export type ReorderBody = z.infer<typeof ReorderBodySchema>;
