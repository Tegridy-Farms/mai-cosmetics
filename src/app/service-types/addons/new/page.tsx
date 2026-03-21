'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AddonForm } from '@/components/forms/AddonForm';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { t } from '@/lib/translations';
import type { ServiceType } from '@/types';

export default function NewAddonPage() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast, toasts } = useToast();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/service-types');
      const data = await res.json();
      setServiceTypes(Array.isArray(data) ? data : []);
    } catch {
      showToast(t.toast.couldNotLoad, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading) {
    return (
      <main className="max-w-[560px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="h-10 w-64 bg-skeleton rounded animate-pulse mb-6" />
        <div className="h-48 bg-skeleton rounded-xl animate-pulse" />
      </main>
    );
  }

  return (
    <main className="max-w-[560px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary mb-6">
        {t.serviceTypes.addons.addAddon}
      </h1>
      <AddonForm serviceTypes={serviceTypes} />
      <ToastContainer toasts={toasts} />
    </main>
  );
}
