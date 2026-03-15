import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const IncomeEntrySchema = z.object({
  service_name: z.string().min(1),
  service_type_id: z.number().int().positive(),
  date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  duration_minutes: z.number().int().positive(),
  amount: z.number().positive(),
});

export const IncomeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  service_type_id: z.coerce.number().int().positive().optional(),
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
