'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { ServiceTypesTable } from '@/components/service-types/ServiceTypesTable';
import { DeleteConfirmDialog } from '@/components/entries/DeleteConfirmDialog';
import { t } from '@/lib/translations';
import { AddonsTable } from '@/components/service-types/AddonsTable';
import type { Addon, ServiceType } from '@/types';

export default function ServiceTypesPage() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAddons, setIsLoadingAddons] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDescription, setDeleteDescription] = useState('');
  const [deleteAddonId, setDeleteAddonId] = useState<number | null>(null);
  const [isDeletingAddon, setIsDeletingAddon] = useState(false);
  const [deleteAddonDescription, setDeleteAddonDescription] = useState('');
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

  const fetchAddons = useCallback(async () => {
    setIsLoadingAddons(true);
    try {
      const res = await fetch('/api/addons');
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setAddons(
        list.map((a: Addon) => ({
          ...a,
          price: Number(a.price),
          service_type_ids: Array.isArray(a.service_type_ids) ? a.service_type_ids : [],
        }))
      );
    } catch {
      showToast(t.toast.couldNotLoad, 'error');
    } finally {
      setIsLoadingAddons(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchServiceTypes();
  }, [fetchServiceTypes]);

  useEffect(() => {
    fetchAddons();
  }, [fetchAddons]);

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

  const handleDeleteAddonClick = (addonId: number) => {
    const ad = addons.find((a) => a.id === addonId);
    if (ad) {
      setDeleteAddonDescription(ad.name);
    }
    setDeleteAddonId(addonId);
  };

  const handleDeleteAddonConfirm = async () => {
    if (deleteAddonId === null) return;
    setIsDeletingAddon(true);
    try {
      const res = await fetch(`/api/addons/${deleteAddonId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteAddonId(null);
        setIsDeletingAddon(false);
        await fetchAddons();
      } else {
        showToast(t.toast.couldNotDelete, 'error');
      }
    } catch {
      showToast(t.toast.couldNotDelete, 'error');
    } finally {
      setDeleteAddonId(null);
      setIsDeletingAddon(false);
    }
  };

  const handleDeleteAddonClose = () => {
    setDeleteAddonId(null);
    setIsDeletingAddon(false);
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
          showToast={showToast}
          onReorderComplete={fetchServiceTypes}
        />
      </div>

      <section className="mt-10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
              {t.serviceTypes.addons.sectionTitle}
            </h2>
            <p className="text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
              {t.serviceTypes.addons.sectionHint}
            </p>
          </div>
          <Link href="/service-types/addons/new">
            <Button variant="primary">+ {t.serviceTypes.addons.addAddon}</Button>
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <AddonsTable
            addons={addons}
            serviceTypes={serviceTypes}
            isLoading={isLoadingAddons}
            onDelete={handleDeleteAddonClick}
          />
        </div>
      </section>

      <DeleteConfirmDialog
        isOpen={deleteId !== null}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        entryDescription={deleteDescription}
      />

      <DeleteConfirmDialog
        isOpen={deleteAddonId !== null}
        onClose={handleDeleteAddonClose}
        onConfirm={handleDeleteAddonConfirm}
        isDeleting={isDeletingAddon}
        entryDescription={deleteAddonDescription}
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
}
