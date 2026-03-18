'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LeadSourceForm } from '@/components/forms/LeadSourceForm';
import { t } from '@/lib/translations';
import type { LeadSource } from '@/types';

export default function EditLeadSourcePage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);
  const [leadSource, setLeadSource] = useState<LeadSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isNaN(id)) return;
    fetch(`/api/lead-sources/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) router.push('/customers/lead-sources');
          return;
        }
        const data = await res.json();
        setLeadSource(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id, router]);

  if (isNaN(id) || isLoading || !leadSource) {
    return (
      <div className="max-w-[560px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8">
        <div className="h-8 w-48 bg-skeleton rounded animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary mb-6">
        {t.leadSources.editLeadSource}
      </h1>
      <LeadSourceForm
        initialName={leadSource.name}
        initialSortOrder={leadSource.sort_order}
        leadSourceId={leadSource.id}
      />
    </>
  );
}
