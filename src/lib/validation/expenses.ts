import { z } from 'zod';
import { dateRegex } from '@/lib/validation/common';

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
