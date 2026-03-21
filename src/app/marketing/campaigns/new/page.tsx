'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { CampaignForm } from '@/components/forms/CampaignForm';
import { ClientApiError, postJson } from '@/lib/api-client';
import { showToastForClientApiError } from '@/lib/api-error-toast';
import { t } from '@/lib/translations';

export default function NewMarketingCampaignPage() {
  const router = useRouter();
  const { showToast, toasts } = useToast();

  async function onSave(data: Record<string, unknown>) {
    try {
      await postJson('/api/campaigns', data);
      showToast(t.campaigns.saved, 'success');
      router.push('/marketing/campaigns');
    } catch (e) {
      if (e instanceof ClientApiError) {
        showToastForClientApiError(e, showToast);
      } else {
        showToast(t.toast.couldNotSave, 'error');
      }
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

