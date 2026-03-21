'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { CampaignForm } from '@/components/forms/CampaignForm';
import { ClientApiError, getJson, putJson } from '@/lib/api-client';
import { showToastForClientApiError } from '@/lib/api-error-toast';
import { t } from '@/lib/translations';
import type { Campaign } from '@/types';

export default function EditMarketingCampaignPage() {
  const params = useParams() ?? {};
  const router = useRouter();
  const id = parseInt((params as any).id as string, 10);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast, toasts } = useToast();

  useEffect(() => {
    if (isNaN(id)) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getJson<Campaign>(`/api/campaigns/${id}`);
        if (!cancelled) setCampaign(data);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ClientApiError && e.status === 404) {
          router.push('/marketing/campaigns');
          return;
        }
        if (e instanceof ClientApiError) {
          showToastForClientApiError(e, showToast);
        } else {
          showToast(t.toast.couldNotLoad, 'error');
        }
        router.push('/marketing/campaigns');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, router, showToast]);

  async function onSave(data: Record<string, unknown>) {
    try {
      await putJson(`/api/campaigns/${id}`, data);
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

  if (isNaN(id) || isLoading) {
    return (
      <div className="max-w-[900px] mx-auto w-full">
        <div className="h-8 w-48 bg-skeleton rounded animate-pulse" />
      </div>
    );
  }

  if (!campaign) return null;

  return (
    <div className="max-w-[900px] mx-auto w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">{t.campaigns.editCampaign}</h2>
      <CampaignForm initial={campaign} onSave={onSave} onCancelHref="/marketing/campaigns" />
      <ToastContainer toasts={toasts} />
    </div>
  );
}

