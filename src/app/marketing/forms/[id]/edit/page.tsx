'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { AdminFormForm } from '@/components/forms/AdminFormForm';
import { t } from '@/lib/translations';
import type { Campaign, Form } from '@/types';

export default function EditMarketingFormPage() {
  const params = useParams() ?? {};
  const router = useRouter();
  const id = parseInt((params as any).id as string, 10);
  const [form, setForm] = useState<Form | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast, toasts } = useToast();

  useEffect(() => {
    if (isNaN(id)) return;
    Promise.all([fetch(`/api/forms/${id}`), fetch('/api/campaigns')])
      .then(async ([formRes, campRes]) => {
        if (!formRes.ok) throw new Error('not ok');
        setForm(await formRes.json());
        setCampaigns(await campRes.json());
      })
      .catch(() => router.push('/marketing/forms'))
      .finally(() => setIsLoading(false));
  }, [id, router]);

  const publicUrl = useMemo(() => {
    if (!form) return '';
    return `${window.location.origin}/f/${encodeURIComponent(form.slug)}`;
  }, [form]);

  async function copyLink() {
    if (!form) return;
    const url = `${window.location.origin}/f/${encodeURIComponent(form.slug)}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast(t.adminForms.copied, 'success');
    } catch {
      showToast(t.toast.couldNotSave, 'error');
    }
  }

  async function onSave(data: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('failed');
      showToast(t.toast.saved, 'success');
      router.push('/marketing/forms');
    } catch {
      showToast(t.toast.couldNotSave, 'error');
    }
  }

  if (isNaN(id) || isLoading) {
    return (
      <div className="max-w-[900px] mx-auto w-full">
        <div className="h-8 w-48 bg-skeleton rounded animate-pulse" />
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="max-w-[900px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">{t.adminForms.editForm}</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" type="button" onClick={copyLink}>
            {t.adminForms.copyLink}
          </Button>
          <a
            className="inline-flex items-center justify-center h-[44px] px-4 rounded-lg border border-border text-primary underline"
            href={`/f/${encodeURIComponent(form.slug)}`}
            target="_blank"
            rel="noreferrer"
          >
            {t.adminForms.publicLink}
          </a>
        </div>
      </div>

      {publicUrl ? <div className="mb-4 text-xs text-text-secondary font-mono break-all">{publicUrl}</div> : null}

      <AdminFormForm initial={form} campaigns={campaigns} onSave={onSave} onCancelHref="/marketing/forms" />
      <ToastContainer toasts={toasts} />
    </div>
  );
}

