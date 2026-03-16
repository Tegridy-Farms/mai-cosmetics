'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { CustomersTable } from '@/components/customers/CustomersTable';
import { Pagination } from '@/components/entries/Pagination';
import { DeleteConfirmDialog } from '@/components/entries/DeleteConfirmDialog';
import { t } from '@/lib/translations';
import { formatDate } from '@/lib/format';
import type { Customer, LeadSource, CustomerFilterState } from '@/types';

interface CustomerWithMeta extends Customer {
  lead_source_name?: string | null;
  last_visit?: string | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithMeta[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<CustomerFilterState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDescription, setDeleteDescription] = useState('');
  const { showToast, toasts } = useToast();

  useEffect(() => {
    fetch('/api/lead-sources')
      .then((r) => r.json())
      .then((data) => setLeadSources(data))
      .catch(() => {});
  }, []);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (filters.search) params.set('search', filters.search);
      if (filters.lead_source_id) params.set('lead_source_id', String(filters.lead_source_id));
      if (filters.date_from) params.set('date_from', filters.date_from);
      if (filters.date_to) params.set('date_to', filters.date_to);

      const res = await fetch(`/api/customers?${params.toString()}`);
      const json = await res.json();
      setCustomers(json.data);
      setTotal(json.total);
    } catch {
      showToast(t.toast.couldNotLoad, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, filters, showToast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleFilterChange = (newFilters: Partial<CustomerFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleFilterClear = () => {
    setFilters({});
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleDeleteClick = (id: number) => {
    const customer = customers.find((c) => c.id === id);
    if (customer) {
      setDeleteDescription(`${customer.first_name} ${customer.last_name}`);
    }
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/customers/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteId(null);
        setIsDeleting(false);
        await fetchCustomers();
      } else {
        const data = await res.json();
        if (data.code === 'IN_USE') {
          showToast(t.customers.cannotDeleteHasSessions, 'error');
        } else {
          showToast(t.toast.couldNotDelete, 'error');
        }
      }
    } catch {
      setDeleteId(null);
      setIsDeleting(false);
      showToast(t.toast.couldNotDelete, 'error');
    } finally {
      setDeleteId(null);
      setIsDeleting(false);
    }
  };

  const handleDeleteClose = () => {
    setDeleteId(null);
    setIsDeleting(false);
  };

  const ALL_LEAD_SOURCES = '__all__';
  const leadSourceOptions = [
    { value: ALL_LEAD_SOURCES, label: t.customers.allLeadSources },
    ...leadSources.map((ls) => ({ value: String(ls.id), label: ls.name })),
  ];

  const isFilterActive =
    !!filters.search || !!filters.lead_source_id || !!filters.date_from || !!filters.date_to;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary">{t.customers.title}</h1>
        <Link href="/customers/new">
          <Button variant="primary">+ {t.customers.addCustomer}</Button>
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-border">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="min-w-[200px] flex-1">
              <Label htmlFor="customer-search">{t.customers.search}</Label>
              <Input
                id="customer-search"
                type="text"
                placeholder={t.customers.searchPlaceholder}
                value={filters.search ?? ''}
                onChange={(e) => handleFilterChange({ search: e.target.value || undefined })}
              />
            </div>
            <div className="w-full sm:w-auto min-w-[140px]">
              <Label htmlFor="lead_source_id">{t.customers.leadSource}</Label>
              <Select
                id="lead_source_id"
                options={leadSourceOptions}
                value={filters.lead_source_id ? String(filters.lead_source_id) : ALL_LEAD_SOURCES}
                onValueChange={(v) =>
                  handleFilterChange({ lead_source_id: v && v !== ALL_LEAD_SOURCES ? Number(v) : undefined })
                }
                placeholder={t.customers.allLeadSources}
              />
            </div>
            <div className="min-w-[120px]">
              <Label htmlFor="date_from">{t.entries.from}</Label>
              <input
                id="date_from"
                type="date"
                value={filters.date_from ?? ''}
                onChange={(e) => handleFilterChange({ date_from: e.target.value || undefined })}
                className="min-h-[44px] h-[44px] w-full border border-border rounded-lg px-3 text-sm"
              />
            </div>
            <div className="min-w-[120px]">
              <Label htmlFor="date_to">{t.entries.to}</Label>
              <input
                id="date_to"
                type="date"
                value={filters.date_to ?? ''}
                onChange={(e) => handleFilterChange({ date_to: e.target.value || undefined })}
                className="min-h-[44px] h-[44px] w-full border border-border rounded-lg px-3 text-sm"
              />
            </div>
            {isFilterActive && (
              <Button variant="ghost" onClick={handleFilterClear}>
                {t.entries.clearFilters}
              </Button>
            )}
          </div>
        </div>

        <CustomersTable
          customers={customers}
          isLoading={isLoading}
          onDelete={handleDeleteClick}
        />

        <Pagination
          total={total}
          page={page}
          pageSize={20}
          onChange={handlePageChange}
        />
      </div>

      <DeleteConfirmDialog
        isOpen={deleteId !== null}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        entryDescription={deleteDescription}
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
}
