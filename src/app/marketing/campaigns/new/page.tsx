'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { CampaignForm } from '@/components/forms/CampaignForm';
import { t } from '@/lib/translations';

export default function NewMarketingCampaignPage() {
  const router = useRouter();
  const { showToast, toasts } = useToast();

  async function onSave(data: Record<string, unknown>) {
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('failed');
      showToast(t.campaigns.saved, 'success');
      router.push('/marketing/campaigns');
    } catch {
      showToast(t.toast.couldNotSave, 'error');
    }
  }

  return (
    <div className="max-w-[900px] mx-auto w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">{t.campaigns.addCampaign}</h2>
      <CampaignForm onSave={onSave} onCancelHref="/marketing/campaigns" />
      <ToastContainer toasts={toasts} />
    </div>
  );
}

