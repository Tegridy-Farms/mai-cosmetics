'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { LeadManualForm } from '@/components/forms/LeadManualForm';
import { t } from '@/lib/translations';
import type { Campaign, Form } from '@/types';

export default function NewLeadPage() {
  const router = useRouter();
  const { showToast, toasts } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [forms, setForms] = useState<Form[]>([]);

  useEffect(() => {
    Promise.all([fetch('/api/campaigns'), fetch('/api/forms')])
      .then(async ([c, f]) => {
        setCampaigns(await c.json());
        setForms(await f.json());
      })
      .catch(() => {
        setCampaigns([]);
        setForms([]);
      });
  }, []);

  async function onSave(data: Record<string, unknown>) {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('failed');
      router.push('/leads');
    } catch {
      showToast(t.toast.couldNotSave, 'error');
    }
  }

  return (
    <div className="max-w-[900px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary mb-6">{t.leads.addLead}</h1>
      <LeadManualForm campaigns={campaigns} forms={forms} onSave={onSave} onCancelHref="/leads" />
      <ToastContainer toasts={toasts} />
    </div>
  );
}

