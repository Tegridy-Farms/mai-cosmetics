'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { t } from '@/lib/translations';
import type { Campaign, Form, FormStatus } from '@/types';
import { coercePublicFormUi, withPublicFormDefaults } from '@/lib/form-ui';

const statusOptions: { value: FormStatus; label: string }[] = [
  { value: 'draft', label: t.adminForms.draft },
  { value: 'published', label: t.adminForms.published },
  { value: 'archived', label: t.adminForms.archived },
];

export function AdminFormForm({
  initial,
  campaigns,
  onSave,
  onCancelHref,
}: {
  initial?: Partial<Form>;
  campaigns: Campaign[];
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancelHref: string;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [status, setStatus] = useState<FormStatus>((initial?.status as FormStatus) ?? 'draft');
  const [campaignId, setCampaignId] = useState<string>(initial?.campaign_id ? String(initial.campaign_id) : '');

  const initialUi = useMemo(() => withPublicFormDefaults(coercePublicFormUi(initial?.ui_schema ?? {})), [initial?.ui_schema]);
  const [headline, setHeadline] = useState(initialUi.headline);
  const [subheadline, setSubheadline] = useState(initialUi.subheadline);
  const [ctaLabel, setCtaLabel] = useState(initialUi.cta_label);
  const [privacyNote, setPrivacyNote] = useState(initialUi.privacy_note);
  const [showEmail, setShowEmail] = useState(Boolean(initialUi.show_email));
  const [showMarketingConsent, setShowMarketingConsent] = useState(Boolean(initialUi.show_marketing_consent));

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedText, setAdvancedText] = useState(() => JSON.stringify(initial?.ui_schema ?? {}, null, 2));
  const [loading, setLoading] = useState(false);

  const campaignOptions = useMemo(
    () => [
      { value: '', label: '—' },
      ...campaigns.map((c) => ({ value: String(c.id), label: c.name })),
    ],
    [campaigns]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const baseUiSchema = {
        headline,
        subheadline,
        cta_label: ctaLabel,
        privacy_note: privacyNote,
        show_email: showEmail,
        show_marketing_consent: showMarketingConsent,
      };

      let advanced: Record<string, unknown> = {};
      if (showAdvanced) {
        try {
          advanced = advancedText.trim().length ? (JSON.parse(advancedText) as Record<string, unknown>) : {};
        } catch {
          advanced = {};
        }
      }

      const ui_schema = showAdvanced ? { ...advanced, ...baseUiSchema } : baseUiSchema;

      await onSave({
        name,
        slug,
        status,
        campaign_id: campaignId === '' ? null : Number(campaignId),
        ui_schema,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t.adminForms.name}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t.adminForms.slug}</label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="2026-04_brows_instagram_consult" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t.adminForms.status}</label>
            <Select options={statusOptions} value={status} onValueChange={(v) => setStatus(v as FormStatus)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t.adminForms.campaign}</label>
            <Select
              options={campaignOptions}
              value={campaignId}
              onValueChange={(v) => setCampaignId(v)}
              placeholder={t.adminForms.campaign}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="text-lg font-semibold text-text-primary">{t.adminForms.builder}</div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.adminForms.headline}</label>
            <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.adminForms.subheadline}</label>
            <Input value={subheadline} onChange={(e) => setSubheadline(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.adminForms.ctaLabel}</label>
            <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.adminForms.privacyNote}</label>
            <Input value={privacyNote} onChange={(e) => setPrivacyNote(e.target.value)} />
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-start gap-3 text-sm text-text-secondary">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-primary"
                checked={showEmail}
                onChange={(e) => setShowEmail(e.target.checked)}
              />
              <span>{t.adminForms.showEmail}</span>
            </label>

            <label className="flex items-start gap-3 text-sm text-text-secondary">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-primary"
                checked={showMarketingConsent}
                onChange={(e) => setShowMarketingConsent(e.target.checked)}
              />
              <span>{t.adminForms.showMarketingConsent}</span>
            </label>
          </div>

          <button
            type="button"
            className="mt-2 text-sm text-primary underline hover:text-primary-dark"
            onClick={() => setShowAdvanced((s) => !s)}
          >
            {t.adminForms.advanced}
          </button>

          {showAdvanced ? (
            <div className="pt-2">
              <label className="block text-sm font-medium mb-1">{t.adminForms.advancedJson}</label>
              <textarea
                value={advancedText}
                onChange={(e) => setAdvancedText(e.target.value)}
                className="w-full min-h-[180px] px-3 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-focusRing focus:border-focusRing font-mono text-[12px]"
              />
              <div className="text-xs text-text-secondary mt-2">
                שימי לב: שמירה תשלב את ההגדרות מהבנאי עם ה-JSON.
              </div>
            </div>
          ) : null}
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <div className="text-lg font-semibold text-text-primary mb-4">{t.adminForms.preview}</div>
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="text-sm text-text-secondary">{name || t.adminForms.title}</div>
              <h2 className="text-3xl font-bold leading-tight mt-2">{headline || t.publicForms.defaultHeadline}</h2>
              <p className="text-text-secondary mt-2">{subheadline || t.publicForms.defaultSubheadline}</p>
            </div>

            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t.publicForms.fullNameLabel}</label>
                <Input disabled placeholder={t.publicForms.fullNamePlaceholder} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.publicForms.phoneLabel}</label>
                <Input disabled placeholder={t.publicForms.phonePlaceholder} />
              </div>
              {showEmail ? (
                <div>
                  <label className="block text-sm font-medium mb-1">{t.publicForms.emailOptionalLabel}</label>
                  <Input disabled placeholder={t.publicForms.emailPlaceholder} />
                </div>
              ) : null}

              {showMarketingConsent ? (
                <label className="flex items-start gap-3 text-sm text-text-secondary">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" disabled />
                  <span>{t.publicForms.marketingConsentLabel}</span>
                </label>
              ) : null}

              <Button type="button" disabled className="w-full">
                {ctaLabel || t.publicForms.submitCta}
              </Button>

              <div className="text-xs text-text-secondary leading-relaxed">{privacyNote || t.publicForms.privacyNote}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" loading={loading}>
          {t.forms.save}
        </Button>
        <a href={onCancelHref} className="inline-flex items-center justify-center h-[44px] px-4 rounded-lg border border-border">
          {t.entries.cancel}
        </a>
      </div>
    </form>
  );
}

