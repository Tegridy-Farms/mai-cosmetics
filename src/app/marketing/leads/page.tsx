'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Pagination } from '@/components/entries/Pagination';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { LeadsTable, type LeadListRow } from '@/components/leads/LeadsTable';
import { ClientApiError, getJson } from '@/lib/api-client';
import { showToastForClientApiError } from '@/lib/api-error-toast';
import { t } from '@/lib/translations';
import type { LeadStage } from '@/types';

type LeadsResponse = { data: LeadListRow[]; total: number; page: number; pageSize: number };

const stageOptions: { value: string; label: string }[] = [
  { value: '', label: '—' },
  { value: 'new', label: t.leads.new },
  { value: 'qualified', label: t.leads.qualified },
  { value: 'contacted', label: t.leads.contacted },
  { value: 'scheduled', label: t.leads.scheduled },
  { value: 'converted', label: t.leads.converted },
  { value: 'lost', label: t.leads.lost },
];

export default function MarketingLeadsPage() {
  const [page, setPage] = useState(1);
  const [stage, setStage] = useState<LeadStage | ''>('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState<LeadListRow[]>([]);
  const [total, setTotal] = useState(0);
  const { showToast, toasts } = useToast();

  const queryString = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set('page', String(page));
    if (stage) sp.set('stage', stage);
    if (search.trim()) sp.set('search', search.trim());
    return sp.toString();
  }, [page, stage, search]);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const json = await getJson<LeadsResponse>(`/api/leads?${queryString}`);
      setRows(json.data ?? []);
      setTotal(json.total ?? 0);
    } catch (e) {
      if (e instanceof ClientApiError) {
        showToastForClientApiError(e, showToast);
      } else {
        showToast(t.toast.couldNotLoad, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [queryString, showToast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">{t.leads.title}</h2>
        <div className="flex gap-2">
          <Link href="/marketing/leads/analytics">
            <Button variant="ghost">{t.leads.analytics}</Button>
          </Link>
          <Link href="/marketing/leads/new">
            <Button variant="primary">+ {t.leads.addLead}</Button>
          </Link>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">{t.leads.stage}</label>
            <Select options={stageOptions} value={stage} onValueChange={(v) => (setPage(1), setStage(v as LeadStage | ''))} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">{t.customers.search}</label>
            <Input value={search} onChange={(e) => (setPage(1), setSearch(e.target.value))} placeholder={t.customers.searchPlaceholder} />
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <LeadsTable leads={rows} isLoading={isLoading} />
        <Pagination total={total} page={page} onChange={setPage} />
      </div>

      <ToastContainer toasts={toasts} />
    </>
  );
}

