import { z } from 'zod';
import { PublicFormUiSchema } from '@/lib/form-ui';
import { slugRegex } from '@/lib/validation/common';

export const FormSchema = z.object({
  campaign_id: z.number().int().positive().nullable().optional(),
  name: z.string().min(1).max(150).trim(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .trim()
    .regex(slugRegex, 'Slug must be lowercase letters/numbers with hyphens or underscores'),
  status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
  ui_schema: PublicFormUiSchema.passthrough().optional().default({}),
});
