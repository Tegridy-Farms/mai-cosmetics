'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { t } from '@/lib/translations';
import type { Campaign, Form, SourceChannel, LeadStage } from '@/types';

const sourceOptions: { value: SourceChannel; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'referral', label: 'Referral' },
  { value: 'other', label: 'Other' },
];

const stageOptions: { value: LeadStage; label: string }[] = [
  { value: 'new', label: t.leads.new },
  { value: 'qualified', label: t.leads.qualified },
  { value: 'contacted', label: t.leads.contacted },
  { value: 'scheduled', label: t.leads.scheduled },
  { value: 'converted', label: t.leads.converted },
  { value: 'lost', label: t.leads.lost },
];

export function LeadManualForm({
  campaigns,
  forms,
  onSave,
  onCancelHref,
}: {
  campaigns: Campaign[];
  forms: Form[];
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancelHref: string;
}) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<SourceChannel>('instagram');
  const [stage, setStage] = useState<LeadStage>('new');
  const [campaignId, setCampaignId] = useState('');
  const [formId, setFormId] = useState('');
  const [loading, setLoading] = useState(false);

  const campaignOptions = useMemo(
    () => [{ value: '', label: '—' }, ...campaigns.map((c) => ({ value: String(c.id), label: c.name }))],
    [campaigns]
  );
  const formOptions = useMemo(
    () => [{ value: '', label: '—' }, ...forms.map((f) => ({ value: String(f.id), label: f.name }))],
    [forms]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        full_name: fullName,
        phone,
        email,
        source_channel: source,
        stage,
        campaign_id: campaignId === '' ? null : Number(campaignId),
        form_id: formId === '' ? null : Number(formId),
        consent_marketing: false,
        attribution: {},
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t.leads.name}</label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t.leads.source}</label>
          <Select options={sourceOptions} value={source} onValueChange={(v) => setSource(v as SourceChannel)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t.leads.phone}</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t.leads.email}</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t.leads.stage}</label>
          <Select options={stageOptions} value={stage} onValueChange={(v) => setStage(v as LeadStage)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t.leads.campaign}</label>
          <Select options={campaignOptions} value={campaignId} onValueChange={(v) => setCampaignId(v)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t.leads.form}</label>
          <Select options={formOptions} value={formId} onValueChange={(v) => setFormId(v)} />
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

