import { z } from 'zod';
import { t } from '@/lib/translations';
import { dateRegex } from '@/lib/validation/common';

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

/** Browser forms: string selects/combobox IDs; Hebrew messages via `t.forms`. */
export const IncomeFormClientSchema = z.object({
  service_name: z.string().min(1, t.forms.serviceNameRequired),
  service_type_id: z.string().min(1, t.forms.serviceTypeRequired),
  customer_id: z.string().optional(),
  date: z.string().min(1, t.forms.dateRequired),
  duration_minutes: z
    .string()
    .min(1, t.forms.durationRequired)
    .transform((s) => Number(s))
    .pipe(z.number().int(t.forms.durationWhole).positive(t.forms.durationRequired)),
  amount: z
    .string()
    .min(1, t.forms.amountRequired)
    .transform((s) => Number(s))
    .pipe(z.number().positive(t.forms.amountRequired)),
});

export type IncomeFormClientValues = z.infer<typeof IncomeFormClientSchema>;
