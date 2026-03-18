'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { CampaignForm } from '@/components/forms/CampaignForm';
import { t } from '@/lib/translations';
import type { Campaign } from '@/types';

export default function EditCampaignPage() {
  const params = useParams() ?? {};
  const router = useRouter();
  const id = parseInt((params as any).id as string, 10);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast, toasts } = useToast();

  useEffect(() => {
    if (isNaN(id)) return;
    fetch(`/api/campaigns/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('not ok');
        setCampaign(await res.json());
      })
      .catch(() => router.push('/campaigns'))
      .finally(() => setIsLoading(false));
  }, [id, router]);

  async function onSave(data: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('failed');
      showToast(t.campaigns.saved, 'success');
      router.push('/campaigns');
    } catch {
      showToast(t.toast.couldNotSave, 'error');
    }
  }

  if (isNaN(id) || isLoading) {
    return (
      <div className="max-w-[900px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="h-8 w-48 bg-skeleton rounded animate-pulse" />
      </div>
    );
  }

  if (!campaign) return null;

  return (
    <div className="max-w-[900px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary mb-6">{t.campaigns.editCampaign}</h1>
      <CampaignForm initial={campaign} onSave={onSave} onCancelHref="/campaigns" />
      <ToastContainer toasts={toasts} />
    </div>
  );
}

