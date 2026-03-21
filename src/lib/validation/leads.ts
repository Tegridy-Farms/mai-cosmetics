import { z } from 'zod';
import { dateRegex } from '@/lib/validation/common';

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

export const LeadReportQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});
