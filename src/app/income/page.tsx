'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { FilterBar } from '@/components/entries/FilterBar';
import { IncomeTable } from '@/components/entries/IncomeTable';
import { Pagination } from '@/components/entries/Pagination';
import { DeleteConfirmDialog } from '@/components/entries/DeleteConfirmDialog';
import { t } from '@/lib/translations';
import { formatDate } from '@/lib/format';
import type { IncomeEntry, ServiceType, FilterState } from '@/types';

export default function IncomePage() {
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDescription, setDeleteDescription] = useState('');
  const { showToast, toasts } = useToast();

  // Fetch service types on mount
  useEffect(() => {
    fetch('/api/service-types')
      .then((r) => r.json())
      .then((data) => setServiceTypes(data))
      .catch(() => {});
  }, []);

  // Fetch income entries
  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (filters.service_type_id) params.set('service_type_id', String(filters.service_type_id));
      if (filters.date_from) params.set('date_from', filters.date_from);
      if (filters.date_to) params.set('date_to', filters.date_to);

      const res = await fetch(`/api/income?${params.toString()}`);
      const json = await res.json();
      setEntries(json.data);
      setTotal(json.total);
    } catch {
      showToast(t.toast.couldNotLoad, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, filters, showToast]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
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
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      setDeleteDescription(`${entry.service_name}, ${formatDate(entry.date)}`);
    }
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/income/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteId(null);
        setIsDeleting(false);
        await fetchEntries();
      } else {
        throw new Error('Delete failed');
      }
    } catch {
      setDeleteId(null);
      setIsDeleting(false);
      showToast(t.toast.couldNotDelete, 'error');
    }
  };

  const handleDeleteClose = () => {
    setDeleteId(null);
    setIsDeleting(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary">{t.pages.incomeEntries}</h1>
        <div className="flex gap-2">
          <Link href="/income/new">
            <Button variant="primary">+ {t.pages.addIncome}</Button>
          </Link>
          <a href="/api/income/export">
            <Button variant="ghost">{t.pages.exportCsv}</Button>
          </a>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-border">
          <FilterBar
            variant="income"
            filters={filters}
            onChange={handleFilterChange}
            onClear={handleFilterClear}
            serviceTypes={serviceTypes}
          />
        </div>

        <IncomeTable
          entries={entries}
          serviceTypes={serviceTypes}
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
