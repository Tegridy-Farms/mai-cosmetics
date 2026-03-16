'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CustomerForm } from '@/components/forms/CustomerForm';
import { t } from '@/lib/translations';
import type { Customer, LeadSource } from '@/types';

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isNaN(id)) return;
    Promise.all([
      fetch(`/api/customers/${id}`),
      fetch('/api/lead-sources'),
    ])
      .then(async ([custRes, lsRes]) => {
        if (!custRes.ok) {
          if (custRes.status === 404) router.push('/customers');
          return;
        }
        const custData = await custRes.json();
        setCustomer(custData);
        setLeadSources(await lsRes.json());
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id, router]);

  if (isNaN(id) || isLoading || !customer) {
    return (
      <div className="max-w-[1200px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="h-8 w-48 bg-skeleton rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary mb-6">
        {t.customers.editCustomer}
      </h1>
      <CustomerForm
        initialFirstName={customer.first_name}
        initialLastName={customer.last_name}
        initialPhone={customer.phone ?? ''}
        initialEmail={customer.email ?? ''}
        initialLeadSourceId={customer.lead_source_id ?? null}
        customerId={customer.id}
        leadSources={leadSources}
      />
    </div>
  );
}
