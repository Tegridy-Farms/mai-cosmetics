'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { LeadManualForm } from '@/components/forms/LeadManualForm';
import { ClientApiError, getJson, postJson } from '@/lib/api-client';
import { showToastForClientApiError } from '@/lib/api-error-toast';
import { t } from '@/lib/translations';
import type { Campaign, Form } from '@/types';

export default function NewMarketingLeadPage() {
  const router = useRouter();
  const { showToast, toasts } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [forms, setForms] = useState<Form[]>([]);

  useEffect(() => {
    Promise.all([getJson<Campaign[]>('/api/campaigns'), getJson<Form[]>('/api/forms')])
      .then(([c, f]) => {
        setCampaigns(c);
        setForms(f);
      })
      .catch((e) => {
        setCampaigns([]);
        setForms([]);
        if (e instanceof ClientApiError) {
          showToastForClientApiError(e, showToast);
        }
      });
  }, [showToast]);

  async function onSave(data: Record<string, unknown>) {
    try {
      await postJson('/api/leads', data);
      router.push('/marketing/leads');
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
      <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">{t.leads.addLead}</h2>
      <LeadManualForm campaigns={campaigns} forms={forms} onSave={onSave} onCancelHref="/marketing/leads" />
      <ToastContainer toasts={toasts} />
    </div>
  );
}

