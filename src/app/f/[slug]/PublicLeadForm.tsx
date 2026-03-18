'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToastContainer, useToast } from '@/components/ui/toast';
import { t } from '@/lib/translations';
import { coercePublicFormUi, withPublicFormDefaults } from '@/lib/form-ui';

type PublicForm = {
  id: number;
  name: string;
  slug: string;
  ui_schema: Record<string, unknown>;
};

function getQueryParam(name: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const v = new URLSearchParams(window.location.search).get(name);
  return v ?? undefined;
}

export function PublicLeadForm({ form }: { form: PublicForm }) {
  const { showToast, toasts } = useToast();
  const startedAtMs = useMemo(() => Date.now(), []);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const ui = withPublicFormDefaults(coercePublicFormUi(form.ui_schema));
  const headline = ui.headline;
  const subheadline = ui.subheadline;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        full_name: fullName,
        phone,
        email: ui.show_email ? email : undefined,
        consent_marketing: ui.show_marketing_consent ? consent : false,
        utm_source: getQueryParam('utm_source'),
        utm_medium: getQueryParam('utm_medium'),
        utm_campaign: getQueryParam('utm_campaign'),
        utm_content: getQueryParam('utm_content'),
        utm_term: getQueryParam('utm_term'),
        referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
        landing_path: typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : undefined,
        started_at_ms: startedAtMs,
        honeypot,
      };

      const res = await fetch(`/api/public/forms/${encodeURIComponent(form.slug)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        showToast(t.publicForms.submitFailed, 'error');
        return;
      }

      setSubmitted(true);
      showToast(t.publicForms.submitSuccessToast, 'success');
    } catch {
      showToast(t.publicForms.submitFailed, 'error');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <>
        <ToastContainer toasts={toasts} />
        <div className="max-w-md mx-auto px-4 py-10">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold mb-2">{t.publicForms.thankYouTitle}</h1>
            <p className="text-text-secondary">{t.publicForms.thankYouBody}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} />
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="mb-6">
          <div className="text-sm text-text-secondary">{form.name}</div>
          <h1 className="text-3xl font-bold leading-tight mt-2">{headline}</h1>
          <p className="text-text-secondary mt-2">{subheadline}</p>
        </div>

        <form onSubmit={onSubmit} className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t.publicForms.fullNameLabel}</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t.publicForms.fullNamePlaceholder} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.publicForms.phoneLabel}</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.publicForms.phonePlaceholder} inputMode="tel" />
          </div>

          {ui.show_email ? (
            <div>
              <label className="block text-sm font-medium mb-1">{t.publicForms.emailOptionalLabel}</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.publicForms.emailPlaceholder} inputMode="email" />
            </div>
          ) : null}

          {/* Honeypot (hidden to humans) */}
          <div className="hidden" aria-hidden="true">
            <label className="block text-sm font-medium mb-1">{t.publicForms.honeypotLabel}</label>
            <Input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
          </div>

          {ui.show_marketing_consent ? (
            <label className="flex items-start gap-3 text-sm text-text-secondary">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-primary"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>{t.publicForms.marketingConsentLabel}</span>
            </label>
          ) : null}

          <Button type="submit" loading={loading} className="w-full">
            {ui.cta_label}
          </Button>

          <div className="text-xs text-text-secondary leading-relaxed">{ui.privacy_note}</div>
        </form>
      </div>
    </>
  );
}

