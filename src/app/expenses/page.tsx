'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { FilterBar } from '@/components/entries/FilterBar';
import { ExpenseTable } from '@/components/entries/ExpenseTable';
import { Pagination } from '@/components/entries/Pagination';
import { DeleteConfirmDialog } from '@/components/entries/DeleteConfirmDialog';
import { t } from '@/lib/translations';
import { formatDate } from '@/lib/format';
import type { ExpenseEntry, FilterState } from '@/types';

export default function ExpensesPage() {
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDescription, setDeleteDescription] = useState('');
  const { showToast, toasts } = useToast();

  // Fetch expense entries
  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (filters.category) params.set('category', filters.category);
      if (filters.date_from) params.set('date_from', filters.date_from);
      if (filters.date_to) params.set('date_to', filters.date_to);

      const res = await fetch(`/api/expenses?${params.toString()}`);
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
      setDeleteDescription(`${entry.description}, ${formatDate(entry.date)}`);
    }
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${deleteId}`, { method: 'DELETE' });
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
    <div className="max-w-[1200px] px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-[30px] font-bold text-[#111827]">{t.pages.expenseEntries}</h1>
        <div className="flex gap-2">
          <Link href="/expenses/new">
            <Button variant="primary">+ {t.pages.addExpense}</Button>
          </Link>
          <a href="/api/expenses/export">
            <Button variant="ghost">{t.pages.exportCsv}</Button>
          </a>
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-[8px]">
        <div className="p-4 border-b border-[#E5E7EB]">
          <FilterBar
            variant="expense"
            filters={filters}
            onChange={handleFilterChange}
            onClear={handleFilterClear}
          />
        </div>

        <ExpenseTable
          entries={entries}
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
