'use client';

import React from 'react';
import { LeadSourceForm } from '@/components/forms/LeadSourceForm';
import { t } from '@/lib/translations';

export default function NewLeadSourcePage() {
  return (
    <>
      <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary mb-6">
        {t.leadSources.addLeadSource}
      </h1>
      <LeadSourceForm />
    </>
  );
}
