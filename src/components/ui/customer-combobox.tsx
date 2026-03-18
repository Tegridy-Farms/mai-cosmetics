'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '@/lib/translations';

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  phone?: string | null;
  email?: string | null;
}

interface CustomerComboboxProps {
  id?: string;
  value?: string;
  selectedLabel?: string;
  onValueChange?: (customerId: string, customer: Customer | null) => void;
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
    customers.find((c) => String(c.id) === value) ?? (value && resolvedCustomer ? resolvedCustomer : null);
  const displayText =
    selectedCustomer ? customerLabel(selectedCustomer) : selectedLabel ?? '';

  useEffect(() => {
    if (value && !customers.find((c) => String(c.id) === value)) {
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

  const handleTriggerClick = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleSelect = (customer: Customer | null) => {
    onValueChange?.(customer ? String(customer.id) : '', customer);
    setIsOpen(false);
    setSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, customers.length));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex === 0) {
          handleSelect(null);
        } else if (customers[highlightIndex - 1]) {
          handleSelect(customers[highlightIndex - 1]);
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
        onClick={handleTriggerClick}
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.forms.searchCustomer}
              className="w-full bg-transparent border-none outline-none placeholder:text-text-muted"
              autoComplete="off"
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
          className="absolute top-full left-0 right-0 mt-1 max-h-[240px] overflow-auto bg-surface border border-border rounded-[10px] shadow-md z-50 py-1"
        >
          {isLoading ? (
            <li className="px-3 py-4 text-center text-text-muted text-sm">{t.common.saving}</li>
          ) : customers.length === 0 ? (
            <li className="px-3 py-4 text-center text-text-muted text-sm">{t.customers.searchNoResults}</li>
          ) : (
            <>
              <li
                role="option"
                aria-selected={!value}
                className={`px-3 py-2 text-[14px] cursor-pointer outline-none ${
                  highlightIndex === 0 ? 'bg-primary-tint text-primary' : 'text-text-primary hover:bg-background'
                }`}
                onClick={() => handleSelect(null)}
                onMouseEnter={() => setHighlightIndex(0)}
              >
                — {t.forms.customerOptional}
              </li>
              {customers.map((c, i) => (
                <li
                  key={c.id}
                  role="option"
                  aria-selected={String(c.id) === value}
                  className={`px-3 py-2 text-[14px] cursor-pointer outline-none ${
                    (i + 1) === highlightIndex ? 'bg-primary-tint text-primary' : 'text-text-primary hover:bg-background'
                  }`}
                  onClick={() => handleSelect(c)}
                  onMouseEnter={() => setHighlightIndex(i + 1)}
                >
                  {customerLabel(c)}
                </li>
              ))}
            </>
          )}
        </ul>
      )}
    </div>
  );
}
