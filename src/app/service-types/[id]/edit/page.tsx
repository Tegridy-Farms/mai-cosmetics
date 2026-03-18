'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ServiceTypeForm } from '@/components/forms/ServiceTypeForm';
import { t } from '@/lib/translations';
import type { ServiceType } from '@/types';

export default function EditServiceTypePage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isNaN(id)) return;
    fetch(`/api/service-types/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) router.push('/service-types');
          return;
        }
        const data = await res.json();
        setServiceType(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id, router]);

  if (isNaN(id) || isLoading || !serviceType) {
    return (
      <div className="max-w-[1200px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="h-8 w-48 bg-skeleton rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary mb-6">
        {t.serviceTypes.editServiceType}
      </h1>
      <ServiceTypeForm
        initialName={serviceType.name}
        initialDefaultPrice={serviceType.default_price}
        serviceTypeId={serviceType.id}
      />
    </div>
  );
}
