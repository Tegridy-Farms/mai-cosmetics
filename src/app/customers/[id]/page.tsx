'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { t } from '@/lib/translations';
import { formatDate, formatAmount } from '@/lib/format';
import type { IncomeEntry, ServiceType } from '@/types';

interface CustomerDetail {
  id: number;
  first_name: string;
  last_name: string;
  phone?: string | null;
  email?: string | null;
  lead_source_id?: number | null;
  lead_source_name?: string | null;
  last_visit?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface CustomerStats {
  total_sessions: number;
  total_revenue: number;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast, toasts } = useToast();

  useEffect(() => {
    if (isNaN(id)) return;
    Promise.all([
      fetch(`/api/customers/${id}`),
      fetch(`/api/customers/${id}/stats`),
      fetch(`/api/income?customer_id=${id}&page=1`).catch(() => ({ json: () => ({ data: [] }) })),
      fetch('/api/service-types'),
    ])
      .then(async ([custRes, statsRes, incomeRes, stRes]) => {
        if (!custRes.ok) {
          if (custRes.status === 404) router.push('/customers');
          return;
        }
        setCustomer(await custRes.json());
        setStats(await statsRes.json());
        const incomeJson = await (incomeRes as Response).json();
        setIncomeEntries(incomeJson.data ?? []);
        setServiceTypes(await stRes.json());
      })
      .catch(() => showToast(t.toast.couldNotLoad, 'error'))
      .finally(() => setIsLoading(false));
  }, [id, router, showToast]);

  if (isNaN(id) || isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="h-8 w-48 bg-skeleton rounded animate-pulse" />
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  const getServiceTypeName = (stId: number) =>
    serviceTypes.find((st) => st.id === stId)?.name ?? String(stId);

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary">
          {customer.first_name} {customer.last_name}
        </h1>
        <Link href={`/customers/${id}/edit`}>
          <Button variant="primary">{t.customers.editCustomer}</Button>
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-text-muted">{t.customers.phone}</p>
            <p className="text-text-primary">{customer.phone || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">{t.customers.email}</p>
            <p className="text-text-primary">{customer.email || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">{t.customers.leadSource}</p>
            <p className="text-text-primary">{customer.lead_source_name || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">{t.customers.lastVisit}</p>
            <p className="text-text-primary">
              {customer.last_visit ? formatDate(customer.last_visit) : '—'}
            </p>
          </div>
        </div>

        {stats && (
          <div className="mt-6 pt-6 border-t border-border flex gap-6">
            <div>
              <p className="text-sm text-text-muted">{t.customers.totalSessions}</p>
              <p className="text-xl font-semibold text-text-primary">{stats.total_sessions}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted">{t.customers.totalRevenue}</p>
              <p className="text-xl font-semibold text-text-primary font-mono">
                {formatAmount(stats.total_revenue)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <h2 className="px-4 py-3 border-b border-border text-lg font-semibold text-text-primary">
          {t.customers.sessionsForCustomer}
        </h2>
        {incomeEntries.length === 0 ? (
          <div className="p-6 text-center text-text-muted">{t.customers.noSessions}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead className="border-b border-border">
                <tr>
                  <th className="py-3 px-4 font-medium text-text-muted">{t.entries.date}</th>
                  <th className="py-3 px-4 font-medium text-text-muted">{t.entries.serviceName}</th>
                  <th className="py-3 px-4 font-medium text-text-muted">{t.entries.serviceType}</th>
                  <th className="py-3 px-4 font-medium text-text-muted text-end">{t.entries.amount}</th>
                </tr>
              </thead>
              <tbody>
                {incomeEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border hover:bg-background">
                    <td className="py-3 px-4 text-text-primary">{formatDate(entry.date)}</td>
                    <td className="py-3 px-4 text-text-primary">{entry.service_name}</td>
                    <td className="py-3 px-4 text-text-primary">
                      {getServiceTypeName(entry.service_type_id)}
                    </td>
                    <td className="py-3 px-4 text-text-primary text-end font-mono">
                      {formatAmount(entry.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Link
        href="/customers"
        className="block mt-6 text-center text-primary underline hover:text-primary-dark text-sm"
      >
        {t.customers.backToList}
      </Link>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
