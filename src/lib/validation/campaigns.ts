import { z } from 'zod';
import { dateRegex, slugRegex } from '@/lib/validation/common';

export const CampaignSchema = z.object({
  name: z.string().min(1).max(150).trim(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .trim()
    .regex(slugRegex, 'Slug must be lowercase letters/numbers with hyphens or underscores'),
  channel_focus: z
    .enum(['instagram', 'facebook', 'referral', 'mixed', 'other'])
    .optional()
    .default('mixed'),
  start_date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format').optional().nullable(),
  end_date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format').optional().nullable(),
  budget: z.union([z.number().nonnegative(), z.null()]).optional(),
  notes: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.string().max(5000).trim().optional()
  ),
});
