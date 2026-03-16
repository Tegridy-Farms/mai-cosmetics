'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { ServiceTypesTable } from '@/components/service-types/ServiceTypesTable';
import { DeleteConfirmDialog } from '@/components/entries/DeleteConfirmDialog';
import { t } from '@/lib/translations';
import type { ServiceType } from '@/types';

export default function ServiceTypesPage() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDescription, setDeleteDescription] = useState('');
  const { showToast, toasts } = useToast();

  const fetchServiceTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/service-types');
      const data = await res.json();
      setServiceTypes(data);
    } catch {
      showToast(t.toast.couldNotLoad, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchServiceTypes();
  }, [fetchServiceTypes]);

  const handleDeleteClick = (id: number) => {
    const st = serviceTypes.find((s) => s.id === id);
    if (st) {
      setDeleteDescription(st.name);
    }
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/service-types/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteId(null);
        setIsDeleting(false);
        await fetchServiceTypes();
      } else {
        if (res.status === 409) {
          showToast(t.serviceTypes.cannotDeleteInUse, 'error');
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
    <div className="max-w-[1200px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary">
          {t.serviceTypes.title}
        </h1>
        <Link href="/service-types/new">
          <Button variant="primary">+ {t.serviceTypes.addServiceType}</Button>
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <ServiceTypesTable
          serviceTypes={serviceTypes}
          isLoading={isLoading}
          onDelete={handleDeleteClick}
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
    </div>
  );
}
