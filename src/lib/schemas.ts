import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const IncomeEntrySchema = z.object({
  service_name: z.string().min(1),
  service_type_id: z.number().int().positive(),
  customer_id: z.number().int().positive().nullable().optional(),
  date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  duration_minutes: z.number().int().positive(),
  amount: z.number().positive(),
});

export const IncomeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  service_type_id: z.coerce.number().int().positive().optional(),
  customer_id: z.coerce.number().int().positive().optional(),
  date_from: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format').optional(),
  date_to: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format').optional(),
});

export const ExpenseEntrySchema = z.object({
  description: z.string().min(1),
  category: z.enum(['equipment', 'materials', 'consumables', 'other']),
  date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  amount: z.number().positive(),
});

export const ExpenseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  category: z.enum(['equipment', 'materials', 'consumables', 'other']).optional(),
  date_from: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format').optional(),
  date_to: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format').optional(),
});

export const DashboardQuerySchema = z.object({
  period: z.enum(['month', 'all']).default('month'),
});

export const ServiceTypeSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  default_price: z
    .union([z.number().nonnegative(), z.null()])
    .optional(),
});

export const LeadSourceSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  sort_order: z.number().int().nonnegative().optional().default(0),
});

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
