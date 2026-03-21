'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { t } from '@/lib/translations';

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  phone?: string | null;
  email?: string | null;
}

export const NEW_CUSTOMER_VALUE = '__new__';

interface CustomerComboboxProps {
  id?: string;
  value?: string;
  selectedLabel?: string;
  onValueChange?: (customerId: string, customer: Customer | null) => void;
  onAddNew?: () => void;
  disabled?: boolean;
  placeholder?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-describedby'?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

async function fetchCustomers(search: string): Promise<Customer[]> {
  const params = new URLSearchParams({ page: '1', page_size: '100' });
  if (search.trim()) params.set('search', search.trim());
  const res = await fetch(`/api/customers?${params.toString()}`);
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

function customerLabel(c: Customer): string {
  const parts = [c.first_name, c.last_name].filter(Boolean);
  if (c.phone || c.email) {
    parts.push(`(${c.phone || c.email})`);
  }
  return parts.join(' ');
}

export function CustomerCombobox({
  id,
  value,
  selectedLabel,
  onValueChange,
  onAddNew,
  disabled = false,
  placeholder = t.forms.selectCustomer,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
}: CustomerComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const debouncedSearch = useDebounce(search, 300);

  const [resolvedCustomer, setResolvedCustomer] = useState<Customer | null>(null);
  const selectedCustomer =
    value === NEW_CUSTOMER_VALUE
      ? null
      : customers.find((c) => String(c.id) === value) ?? (value && resolvedCustomer ? resolvedCustomer : null);
  const displayText =
    value === NEW_CUSTOMER_VALUE
      ? t.forms.newCustomerPending
      : selectedCustomer
        ? customerLabel(selectedCustomer)
        : selectedLabel ?? '';

  useEffect(() => {
    if (value && value !== NEW_CUSTOMER_VALUE && !customers.find((c) => String(c.id) === value)) {
      fetch(`/api/customers/${value}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((c) => setResolvedCustomer(c && String(c.id) === value ? c : null))
        .catch(() => setResolvedCustomer(null));
    } else {
      setResolvedCustomer(null);
    }
  }, [value, customers]);

  const loadCustomers = useCallback(async (q: string) => {
    setIsLoading(true);
    try {
      const data = await fetchCustomers(q);
      setCustomers(data);
      setHighlightIndex(0);
    } catch {
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadCustomers(debouncedSearch);
    }
  }, [isOpen, debouncedSearch, loadCustomers]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && listRef.current && highlightIndex >= 0) {
      const item = listRef.current.children[highlightIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [highlightIndex, isOpen]);

  const handleSelect = (customer: Customer | null) => {
    onValueChange?.(customer ? String(customer.id) : '', customer);
    setIsOpen(false);
    setSearch('');
  };

  /** Highlight index 0 = add-new (when onAddNew); then customers at 1..n */
  const addNewIndex = onAddNew ? 0 : -1;
  const maxHighlightIndex = onAddNew ? customers.length : Math.max(0, customers.length - 1);

  const handleAddNew = () => {
    onAddNew?.();
    onValueChange?.(NEW_CUSTOMER_VALUE, null);
    setIsOpen(false);
    setSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        flushSync(() => {
          setIsOpen(true);
          setSearch('');
        });
        queueMicrotask(() => inputRef.current?.focus());
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, maxHighlightIndex));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (onAddNew && highlightIndex === addNewIndex) {
          handleAddNew();
        } else {
          const ci = onAddNew ? highlightIndex - 1 : highlightIndex;
          if (customers[ci]) handleSelect(customers[ci]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const openAndFocusSearch = () => {
    flushSync(() => {
      setIsOpen(true);
      setSearch('');
    });
    queueMicrotask(() => inputRef.current?.focus());
  };

  const handleComboboxClick = (e: React.MouseEvent) => {
    if (disabled) return;
    if (isOpen && (e.target as HTMLElement).closest('input')) return;
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    openAndFocusSearch();
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={id ? `${id}-listbox` : undefined}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={handleComboboxClick}
        className={`w-full min-h-[44px] px-3 flex items-center justify-between border rounded-[10px] outline-none transition-colors text-start cursor-pointer ${
          ariaInvalid
            ? 'border-error focus:ring-2 focus:ring-error focus:border-error'
            : 'border-border focus:ring-2 focus:ring-focusRing focus:border-focusRing'
        } disabled:bg-background disabled:cursor-not-allowed ${!displayText ? 'text-text-muted' : 'text-text-primary'}`}
      >
        <span className="truncate flex-1 text-start">
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              enterKeyHint="search"
              inputMode="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              placeholder={t.forms.searchCustomer}
              className="w-full min-h-[24px] bg-transparent border-none outline-none placeholder:text-text-muted touch-manipulation"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
          ) : (
            displayText || placeholder
          )}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {value && !isOpen && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(null);
              }}
              className="p-1 rounded hover:bg-background text-text-muted hover:text-text-primary"
              aria-label="נקה בחירה"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <ul
          id={id ? `${id}-listbox` : undefined}
          ref={listRef}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 max-h-[240px] overflow-auto bg-surface border border-border rounded-[10px] shadow-md z-50 pt-0 pb-1"
        >
          {isLoading ? (
            <li className="px-3 py-4 text-center text-text-muted text-sm">{t.common.loading}</li>
          ) : customers.length === 0 && !onAddNew ? (
            <li className="px-3 py-4 text-center text-text-muted text-sm">{t.customers.searchNoResults}</li>
          ) : (
            <>
              {onAddNew && (
                <li
                  role="option"
                  aria-selected={value === NEW_CUSTOMER_VALUE}
                  className={`sticky top-0 z-10 bg-surface border-b border-border px-3 py-2 text-[14px] cursor-pointer outline-none flex items-center gap-2 ${
                    highlightIndex === addNewIndex ? 'bg-primary-tint text-primary' : 'text-primary hover:bg-primary-tint'
                  }`}
                  onClick={handleAddNew}
                  onMouseEnter={() => setHighlightIndex(addNewIndex)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  {t.forms.addNewCustomer}
                </li>
              )}
              {customers.length > 0 ? (
                customers.map((c, i) => {
                  const rowHighlight = onAddNew ? i + 1 === highlightIndex : i === highlightIndex;
                  return (
                    <li
                      key={c.id}
                      role="option"
                      aria-selected={String(c.id) === value}
                      className={`px-3 py-2 text-[14px] cursor-pointer outline-none ${
                        rowHighlight ? 'bg-primary-tint text-primary' : 'text-text-primary hover:bg-background'
                      }`}
                      onClick={() => handleSelect(c)}
                      onMouseEnter={() => setHighlightIndex(onAddNew ? i + 1 : i)}
                    >
                      {customerLabel(c)}
                    </li>
                  );
                })
              ) : (
                !isLoading && (
                  <li className="px-3 py-4 text-center text-text-muted text-sm">{t.customers.searchNoResults}</li>
                )
              )}
            </>
          )}
        </ul>
      )}
    </div>
  );
}
