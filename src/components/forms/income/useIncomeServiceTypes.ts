'use client';

import { useEffect, useState } from 'react';
import { getJson } from '@/lib/api-client';

export interface ServiceTypeOption {
  id: number;
  name: string;
  default_price?: number | null;
  default_duration?: number | null;
}

export function useIncomeServiceTypes(initial: ServiceTypeOption[]) {
  const [effectiveServiceTypes, setEffectiveServiceTypes] = useState<ServiceTypeOption[]>(initial ?? []);
  const [isLoadingServiceTypes, setIsLoadingServiceTypes] = useState(!initial?.length);

  useEffect(() => {
    const types = initial ?? [];
    if (types.length > 0) {
      setEffectiveServiceTypes(types);
      setIsLoadingServiceTypes(false);
      return;
    }
    setIsLoadingServiceTypes(true);
    getJson<unknown[]>('/api/service-types')
      .then((list) => {
        setEffectiveServiceTypes(Array.isArray(list) ? (list as ServiceTypeOption[]) : []);
      })
      .catch(() => {
        setEffectiveServiceTypes([]);
      })
      .finally(() => setIsLoadingServiceTypes(false));
  }, [initial]);

  return { effectiveServiceTypes, isLoadingServiceTypes };
}
