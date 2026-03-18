import { z } from 'zod';
import { PublicFormUiSchema } from '@/lib/form-ui';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
  default_duration: z
    .union([z.number().int().positive(), z.null()])
    .optional(),
});

export const LeadSourceSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  sort_order: z.number().int().nonnegative().optional().default(0),
});

export const CampaignSchema = z.object({
  name: z.string().min(1).max(150).trim(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .trim()
    .regex(slugRegex, 'Slug must be lowercase letters/numbers with hyphens'),
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

export const FormSchema = z.object({
  campaign_id: z.number().int().positive().nullable().optional(),
  name: z.string().min(1).max(150).trim(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .trim()
    .regex(slugRegex, 'Slug must be lowercase letters/numbers with hyphens'),
  status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
  ui_schema: PublicFormUiSchema.passthrough().optional().default({}),
});

export const LeadStageSchema = z.enum(['new', 'qualified', 'contacted', 'scheduled', 'converted', 'lost']);

export const LeadSchema = z.object({
  form_id: z.number().int().positive().nullable().optional(),
  campaign_id: z.number().int().positive().nullable().optional(),
  source_channel: z.enum(['instagram', 'facebook', 'referral', 'other']),
  full_name: z.string().min(1).max(200).trim(),
  phone: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.string().max(50).trim().optional()
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
  consent_marketing: z.coerce.boolean().optional().default(false),
  stage: LeadStageSchema.optional().default('new'),
  lost_reason: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.string().max(200).trim().optional()
  ),
  converted_customer_id: z.number().int().positive().nullable().optional(),
  attribution: z.record(z.unknown()).optional().default({}),
});

export const PublicLeadSubmitSchema = z
  .object({
    full_name: z.string().min(1).max(200).trim(),
    phone: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : val),
      z.string().max(50).trim().optional()
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
    consent_marketing: z.coerce.boolean().optional().default(false),
    source_channel: z.enum(['instagram', 'facebook', 'referral', 'other']).optional(),
    utm_source: z.string().max(200).optional(),
    utm_medium: z.string().max(200).optional(),
    utm_campaign: z.string().max(200).optional(),
    utm_content: z.string().max(200).optional(),
    utm_term: z.string().max(200).optional(),
    referrer: z.string().max(2000).optional(),
    landing_path: z.string().max(2000).optional(),
    started_at_ms: z.coerce.number().int().nonnegative().optional(),
    honeypot: z.string().max(200).optional(),
  })
  .refine((data) => Boolean(data.phone || data.email), {
    message: 'Phone or email is required',
    path: ['phone'],
  });

export const LeadEventSchema = z.object({
  lead_id: z.number().int().positive(),
  type: z.enum(['stage_change', 'note', 'contact_attempt', 'conversion']),
  payload: z.record(z.unknown()).optional().default({}),
});

export const LeadQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().min(1).max(200).optional(),
  search: z.string().max(100).optional(),
  stage: LeadStageSchema.optional(),
  campaign_id: z.coerce.number().int().positive().optional(),
  form_id: z.coerce.number().int().positive().optional(),
  source_channel: z.enum(['instagram', 'facebook', 'referral', 'other']).optional(),
  date_from: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format').optional(),
  date_to: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format').optional(),
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
