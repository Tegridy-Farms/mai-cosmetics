import { z } from 'zod';
import { dateRegex } from '@/lib/validation/common';

export const CustomerSchema = z.object({
  first_name: z.string().min(1).max(100).trim(),
  last_name: z.string().min(1).max(100).trim(),
  phone: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.string().max(20).trim().optional()
  ),
  email: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z
      .string()
      .max(255)
      .trim()
      .refine((s) => !s || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s), 'Invalid email')
      .optional()
  ),
  lead_source_id: z.number().int().positive().nullable().optional(),
  questionnaire_data: z.record(z.unknown()).optional().nullable(),
});

export const CustomerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().min(1).max(200).optional(),
  search: z.string().max(100).optional(),
  lead_source_id: z.coerce.number().int().positive().optional(),
  date_from: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format').optional(),
  date_to: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format').optional(),
});
