'use client';

import React, { useEffect, useState } from 'react';
import { CustomerForm } from '@/components/forms/CustomerForm';
import { t } from '@/lib/translations';
import type { LeadSource } from '@/types';

export default function NewCustomerPage() {
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);

  useEffect(() => {
    fetch('/api/lead-sources')
      .then((r) => r.json())
      .then((data) => setLeadSources(data))
      .catch(() => {});
  }, []);

  return (
    <main className="max-w-[1200px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary mb-6">
        {t.customers.addCustomer}
      </h1>
      <CustomerForm leadSources={leadSources} />
    </main>
  );
}
