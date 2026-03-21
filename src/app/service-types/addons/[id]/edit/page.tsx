'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AddonForm } from '@/components/forms/AddonForm';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { t } from '@/lib/translations';
import type { Addon, ServiceType } from '@/types';

export default function EditAddonPage() {
  const params = useParams() ?? {};
  const router = useRouter();
  const id = parseInt((params as { id: string }).id, 10);
  const [addon, setAddon] = useState<Addon | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast, toasts } = useToast();

  const load = useCallback(async () => {
    if (isNaN(id)) return;
    setIsLoading(true);
    try {
      const [addonRes, stRes] = await Promise.all([
        fetch(`/api/addons/${id}`),
        fetch('/api/service-types'),
      ]);
      if (!addonRes.ok) {
        if (addonRes.status === 404) router.push('/service-types');
        return;
      }
      const addonData = (await addonRes.json()) as Addon;
      setAddon(addonData);
      const stData = await stRes.json();
      setServiceTypes(Array.isArray(stData) ? stData : []);
    } catch {
      showToast(t.toast.couldNotLoad, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [id, router, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  if (isNaN(id) || isLoading || !addon) {
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
        {t.serviceTypes.addons.editAddon}
      </h1>
      <AddonForm
        serviceTypes={serviceTypes}
        addonId={addon.id}
        initialName={addon.name}
        initialPrice={Number(addon.price)}
        initialServiceTypeIds={Array.isArray(addon.service_type_ids) ? addon.service_type_ids : []}
      />
      <ToastContainer toasts={toasts} />
    </main>
  );
}
