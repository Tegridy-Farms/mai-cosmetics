'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { DeleteConfirmDialog } from '@/components/entries/DeleteConfirmDialog';
import { FormsTable } from '@/components/forms/FormsTable';
import { t } from '@/lib/translations';
import type { Campaign, Form } from '@/types';

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDescription, setDeleteDescription] = useState('');
  const { showToast, toasts } = useToast();

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [formsRes, campaignsRes] = await Promise.all([fetch('/api/forms'), fetch('/api/campaigns')]);
      setForms(await formsRes.json());
      setCampaigns(await campaignsRes.json());
    } catch {
      showToast(t.toast.couldNotLoad, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const campaignsById = useMemo(() => new Map(campaigns.map((c) => [c.id, c.name] as const)), [campaigns]);
  const formsWithCampaign = useMemo(
    () =>
      forms.map((f) => ({
        ...f,
        campaign_name: f.campaign_id ? campaignsById.get(f.campaign_id) ?? null : null,
      })),
    [forms, campaignsById]
  );

  const handleDeleteClick = (id: number) => {
    const f = forms.find((x) => x.id === id);
    if (f) setDeleteDescription(f.name);
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/forms/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAll();
      } else {
        showToast(t.toast.couldNotDelete, 'error');
      }
    } catch {
      showToast(t.toast.couldNotDelete, 'error');
    } finally {
      setDeleteId(null);
      setIsDeleting(false);
    }
  };

  const handleDeleteClose = () => {
    setDeleteId(null);
    setIsDeleting(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary">{t.adminForms.title}</h1>
        <Link href="/forms/new">
          <Button variant="primary">+ {t.adminForms.addForm}</Button>
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <FormsTable forms={formsWithCampaign} campaigns={campaigns} isLoading={isLoading} onDelete={handleDeleteClick} />
      </div>

      <DeleteConfirmDialog
        isOpen={deleteId !== null}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        entryDescription={deleteDescription}
      />

      <ToastContainer toasts={toasts} />
    </>
  );
}

