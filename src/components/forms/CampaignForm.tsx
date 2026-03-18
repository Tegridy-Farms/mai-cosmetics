'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { t } from '@/lib/translations';
import type { Campaign, CampaignChannelFocus } from '@/types';

const channelOptions: { value: CampaignChannelFocus; label: string }[] = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'referral', label: 'Referral' },
  { value: 'other', label: 'Other' },
];

export function CampaignForm({
  initial,
  onSave,
  onCancelHref,
}: {
  initial?: Partial<Campaign>;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancelHref: string;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [channelFocus, setChannelFocus] = useState<CampaignChannelFocus>((initial?.channel_focus as CampaignChannelFocus) ?? 'mixed');
  const [startDate, setStartDate] = useState((initial?.start_date as string | null) ?? '');
  const [endDate, setEndDate] = useState((initial?.end_date as string | null) ?? '');
  const [budget, setBudget] = useState(initial?.budget !== undefined && initial?.budget !== null ? String(initial.budget) : '');
  const [notes, setNotes] = useState((initial?.notes as string | null) ?? '');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        name,
        slug,
        channel_focus: channelFocus,
        start_date: startDate || null,
        end_date: endDate || null,
        budget: budget === '' ? null : Number(budget),
        notes,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t.campaigns.name}</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t.campaigns.slug}</label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="2026-04_brows_instagram" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t.campaigns.channelFocus}</label>
          <Select
            options={channelOptions}
            value={channelFocus}
            onValueChange={(v) => setChannelFocus(v as CampaignChannelFocus)}
            placeholder={t.campaigns.channelFocus}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t.campaigns.budget}</label>
          <Input value={budget} onChange={(e) => setBudget(e.target.value)} inputMode="decimal" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t.campaigns.startDate}</label>
          <Input type="date" value={startDate ?? ''} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t.campaigns.endDate}</label>
          <Input type="date" value={endDate ?? ''} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t.campaigns.notes}</label>
        <textarea
          value={notes ?? ''}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full min-h-[96px] px-3 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-focusRing focus:border-focusRing"
        />
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

