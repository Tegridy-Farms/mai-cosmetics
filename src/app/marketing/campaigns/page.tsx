'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { DeleteConfirmDialog } from '@/components/entries/DeleteConfirmDialog';
import { CampaignsTable } from '@/components/campaigns/CampaignsTable';
import { ClientApiError, deleteJson, getJson } from '@/lib/api-client';
import { showToastForClientApiError } from '@/lib/api-error-toast';
import { t } from '@/lib/translations';
import type { Campaign } from '@/types';

export default function MarketingCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDescription, setDeleteDescription] = useState('');
  const { showToast, toasts } = useToast();

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getJson<Campaign[]>('/api/campaigns');
      setCampaigns(data);
    } catch (e) {
      if (e instanceof ClientApiError) {
        showToastForClientApiError(e, showToast);
      } else {
        showToast(t.toast.couldNotLoad, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleDeleteClick = (id: number) => {
    const c = campaigns.find((x) => x.id === id);
    if (c) setDeleteDescription(c.name);
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      await deleteJson(`/api/campaigns/${deleteId}`);
      await fetchCampaigns();
    } catch (e) {
      if (e instanceof ClientApiError) {
        showToastForClientApiError(e, showToast);
      } else {
        showToast(t.toast.couldNotDelete, 'error');
      }
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
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">{t.campaigns.title}</h2>
        <Link href="/marketing/campaigns/new">
          <Button variant="primary">+ {t.campaigns.addCampaign}</Button>
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <CampaignsTable campaigns={campaigns} isLoading={isLoading} onDelete={handleDeleteClick} />
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

