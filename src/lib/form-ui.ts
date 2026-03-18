import { z } from 'zod';
import { t } from '@/lib/translations';

export const PublicFormUiSchema = z.object({
  headline: z.string().max(200).optional(),
  subheadline: z.string().max(500).optional(),
  cta_label: z.string().max(60).optional(),
  privacy_note: z.string().max(500).optional(),
  show_email: z.boolean().optional(),
  show_marketing_consent: z.boolean().optional(),
});

export type PublicFormUi = z.infer<typeof PublicFormUiSchema>;

export function coercePublicFormUi(input: unknown): PublicFormUi {
  const parsed = PublicFormUiSchema.safeParse(input);
  if (parsed.success) return parsed.data;
  return {};
}

export function withPublicFormDefaults(ui: PublicFormUi) {
  return {
    headline: ui.headline?.trim() || t.publicForms.defaultHeadline,
    subheadline: ui.subheadline?.trim() || t.publicForms.defaultSubheadline,
    cta_label: ui.cta_label?.trim() || t.publicForms.submitCta,
    privacy_note: ui.privacy_note?.trim() || t.publicForms.privacyNote,
    show_email: ui.show_email ?? true,
    show_marketing_consent: ui.show_marketing_consent ?? true,
  };
}

