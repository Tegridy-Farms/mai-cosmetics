'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { LeadSourcesTable } from '@/components/lead-sources/LeadSourcesTable';
import { DeleteConfirmDialog } from '@/components/entries/DeleteConfirmDialog';
import { t } from '@/lib/translations';
import type { LeadSource } from '@/types';

export default function LeadSourcesPage() {
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDescription, setDeleteDescription] = useState('');
  const { showToast, toasts } = useToast();

  const fetchLeadSources = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/lead-sources');
      const data = await res.json();
      setLeadSources(data);
    } catch {
      showToast(t.toast.couldNotLoad, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchLeadSources();
  }, [fetchLeadSources]);

  const handleDeleteClick = (id: number) => {
    const ls = leadSources.find((s) => s.id === id);
    if (ls) {
      setDeleteDescription(ls.name);
    }
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/lead-sources/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteId(null);
        setIsDeleting(false);
        await fetchLeadSources();
      } else {
        if (res.status === 409) {
          showToast(t.leadSources.cannotDeleteInUse, 'error');
        } else {
          showToast(t.toast.couldNotDelete, 'error');
        }
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
        <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary">
          {t.leadSources.title}
        </h1>
        <Link href="/customers/lead-sources/new">
          <Button variant="primary">+ {t.leadSources.addLeadSource}</Button>
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <LeadSourcesTable
          leadSources={leadSources}
          isLoading={isLoading}
          onDelete={handleDeleteClick}
          showToast={showToast}
          onReorderComplete={fetchLeadSources}
        />
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
