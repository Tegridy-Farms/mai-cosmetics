'use client';

import React, { useState } from 'react';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { FilterState, ServiceType } from '@/types';

interface FilterBarProps {
  variant: 'income' | 'expense';
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  serviceTypes?: ServiceType[];
}

const CATEGORY_OPTIONS = [
  { value: 'equipment', label: 'equipment' },
  { value: 'materials', label: 'materials' },
  { value: 'consumables', label: 'consumables' },
  { value: 'other', label: 'other' },
];

export function FilterBar({ variant, filters, onChange, onClear, serviceTypes = [] }: FilterBarProps) {
  const [cleared, setCleared] = useState(false);

  const isActive =
    !!filters.service_type_id || !!filters.date_from || !!filters.date_to || !!filters.category;

  const handleClear = () => {
    setCleared(true);
    onClear();
  };

  const serviceTypeOptions = serviceTypes.map((st) => ({
    value: String(st.id),
    label: st.name,
  }));

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {variant === 'income' && (
        <div>
          <Label htmlFor="service_type_id">Service Type</Label>
          <Select
            id="service_type_id"
            options={serviceTypeOptions}
            value={filters.service_type_id ? String(filters.service_type_id) : ''}
            onValueChange={(v) =>
              onChange({ ...filters, service_type_id: v ? Number(v) : undefined })
            }
            placeholder="All types"
          />
        </div>
      )}
      {variant === 'expense' && (
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
            options={CATEGORY_OPTIONS}
            value={filters.category ?? ''}
            onValueChange={(v) => onChange({ ...filters, category: v || undefined })}
            placeholder="All categories"
          />
        </div>
      )}
      <div>
        <Label htmlFor="date_from">From</Label>
        <input
          id="date_from"
          type="date"
          value={filters.date_from ?? ''}
          onChange={(e) => onChange({ ...filters, date_from: e.target.value || undefined })}
          className="h-[36px] border border-[#E5E7EB] rounded-[6px] px-3 text-sm"
        />
      </div>
      <div>
        <Label htmlFor="date_to">To</Label>
        <input
          id="date_to"
          type="date"
          value={filters.date_to ?? ''}
          onChange={(e) => onChange({ ...filters, date_to: e.target.value || undefined })}
          className="h-[36px] border border-[#E5E7EB] rounded-[6px] px-3 text-sm"
        />
      </div>
      {isActive && (
        <Button variant="ghost" onClick={handleClear} className="h-[36px]">
          Clear Filters
        </Button>
      )}
      <div aria-live="polite" className="sr-only">
        {cleared ? 'Filters cleared' : ''}
      </div>
    </div>
  );
}
