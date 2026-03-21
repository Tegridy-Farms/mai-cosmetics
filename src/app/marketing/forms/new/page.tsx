'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { AdminFormForm } from '@/components/forms/AdminFormForm';
import { ClientApiError, getJson, postJson } from '@/lib/api-client';
import { showToastForClientApiError } from '@/lib/api-error-toast';
import { t } from '@/lib/translations';
import type { Campaign } from '@/types';

export default function NewMarketingFormPage() {
  const router = useRouter();
  const { showToast, toasts } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    getJson<Campaign[]>('/api/campaigns')
      .then(setCampaigns)
      .catch((e) => {
        setCampaigns([]);
        if (e instanceof ClientApiError) {
          showToastForClientApiError(e, showToast);
        }
      });
  }, [showToast]);

  async function onSave(data: Record<string, unknown>) {
    try {
      await postJson('/api/forms', data);
      showToast(t.toast.saved, 'success');
      router.push('/marketing/forms');
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
      <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">{t.adminForms.addForm}</h2>
      <AdminFormForm campaigns={campaigns} onSave={onSave} onCancelHref="/marketing/forms" />
      <ToastContainer toasts={toasts} />
    </div>
  );
}

