'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { AdminFormForm } from '@/components/forms/AdminFormForm';
import { t } from '@/lib/translations';
import type { Campaign } from '@/types';

export default function NewFormPage() {
  const router = useRouter();
  const { showToast, toasts } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    fetch('/api/campaigns')
      .then((res) => res.json())
      .then(setCampaigns)
      .catch(() => setCampaigns([]));
  }, []);

  async function onSave(data: Record<string, unknown>) {
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('failed');
      showToast(t.toast.saved, 'success');
      router.push('/forms');
    } catch {
      showToast(t.toast.couldNotSave, 'error');
    }
  }

  return (
    <div className="max-w-[900px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary mb-6">{t.adminForms.addForm}</h1>
      <AdminFormForm campaigns={campaigns} onSave={onSave} onCancelHref="/forms" />
      <ToastContainer toasts={toasts} />
    </div>
  );
}

