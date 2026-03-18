'use client';

import React, { useState } from 'react';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/translations';
import type { FilterState, ServiceType } from '@/types';

interface FilterBarProps {
  variant: 'income' | 'expense';
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  serviceTypes?: ServiceType[];
}

const CATEGORY_OPTIONS = [
  { value: 'equipment', label: t.categories.equipment },
  { value: 'materials', label: t.categories.materials },
  { value: 'consumables', label: t.categories.consumables },
  { value: 'other', label: t.categories.other },
];

export function FilterBar({ variant, filters, onChange, onClear, serviceTypes = [] }: FilterBarProps) {
  const [cleared, setCleared] = useState(false);

  const isActive =
    !!filters.service_type_id || !!filters.date_from || !!filters.date_to || !!filters.category;

  const handleClear = () => {
    setCleared(true);
    onClear();
  };

  const serviceTypeOptions = [
    { value: '__all__', label: t.entries.allTypes },
    ...serviceTypes.map((st) => ({ value: String(st.id), label: st.name })),
  ];

  const categoryOptionsWithAll = [
    { value: '__all__', label: t.entries.allCategories },
    ...CATEGORY_OPTIONS,
  ];

  return (
    <div className="flex flex-wrap gap-3 sm:gap-3 gap-y-4 items-end">
      {variant === 'income' && (
        <div className="w-full sm:w-auto min-w-0">
          <Label htmlFor="service_type_id">{t.entries.serviceType}</Label>
          <Select
            id="service_type_id"
            options={serviceTypeOptions}
            value={filters.service_type_id ? String(filters.service_type_id) : '__all__'}
            onValueChange={(v) =>
              onChange({ ...filters, service_type_id: v === '__all__' ? undefined : Number(v) })
            }
            placeholder={t.entries.allTypes}
          />
        </div>
      )}
      {variant === 'expense' && (
        <div className="w-full sm:w-auto min-w-0">
          <Label htmlFor="category">{t.entries.category}</Label>
          <Select
            id="category"
            options={categoryOptionsWithAll}
            value={filters.category ?? '__all__'}
            onValueChange={(v) => onChange({ ...filters, category: v === '__all__' ? undefined : v })}
            placeholder={t.entries.allCategories}
          />
        </div>
      )}
      <div className="min-w-[120px] sm:min-w-0">
        <Label htmlFor="date_from">{t.entries.from}</Label>
        <input
          id="date_from"
          type="date"
          value={filters.date_from ?? ''}
          onChange={(e) => onChange({ ...filters, date_from: e.target.value || undefined })}
          className="min-h-[44px] h-[44px] sm:h-[36px] sm:min-h-0 border border-border rounded-lg px-3 text-sm w-full sm:w-auto"
        />
      </div>
      <div className="min-w-[120px] sm:min-w-0">
        <Label htmlFor="date_to">{t.entries.to}</Label>
        <input
          id="date_to"
          type="date"
          value={filters.date_to ?? ''}
          onChange={(e) => onChange({ ...filters, date_to: e.target.value || undefined })}
          className="min-h-[44px] h-[44px] sm:h-[36px] sm:min-h-0 border border-border rounded-lg px-3 text-sm w-full sm:w-auto"
        />
      </div>
      {isActive && (
        <Button variant="ghost" onClick={handleClear} className="min-h-[44px] h-[44px] sm:h-[36px] sm:min-h-0">
          {t.entries.clearFilters}
        </Button>
      )}
      <div aria-live="polite" className="sr-only">
        {cleared ? t.entries.filtersCleared : ''}
      </div>
    </div>
  );
}
