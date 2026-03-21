import { z } from 'zod';
import { dateRegex } from '@/lib/validation/common';

const optionalInvoiceUrl = z.preprocess(
  (v) => (v === '' ? null : v),
  z.union([z.string().url(), z.null()]).optional()
);

export const ExpenseEntrySchema = z.object({
  description: z.string().min(1),
  category: z.enum(['equipment', 'materials', 'consumables', 'other']),
  date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  amount: z.number().positive(),
  invoice_url: optionalInvoiceUrl,
});

export const ExpenseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  category: z.enum(['equipment', 'materials', 'consumables', 'other']).optional(),
  date_from: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format').optional(),
  date_to: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format').optional(),
});
