'use client';

import React from 'react';
import * as RadixSelect from '@radix-ui/react-select';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  error?: boolean;
  id?: string;
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
  'aria-describedby'?: string;
  disabled?: boolean;
}

export function Select({
  options,
  placeholder = 'Select...',
  value,
  onValueChange,
  error = false,
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
  disabled = false,
}: SelectProps) {
  // Radix Select items cannot have an empty-string value. We treat empty-string options as "no selection"
  // and rely on the trigger placeholder instead.
  const safeOptions = options.filter((o) => o.value !== '');

  // Only pass value if it exists in options (Radix misbehaves when value doesn't match any item)
  const normalizedValue =
    !value || value === ''
      ? undefined
      : safeOptions.some((o) => o.value === value)
        ? value
        : undefined;
  return (
    <RadixSelect.Root value={normalizedValue} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger
        type="button"
        id={id}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        className={`w-full h-[44px] px-3 flex items-center justify-between border rounded-[10px] outline-none transition-colors text-start ${
          error
            ? 'border-error focus:ring-2 focus:ring-error focus:border-error'
            : 'border-border focus:ring-2 focus:ring-focusRing focus:border-focusRing'
        } disabled:bg-background disabled:cursor-not-allowed ${!value ? 'text-text-muted' : 'text-text-primary'}`}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="bg-surface border border-border rounded-[10px] shadow-md overflow-hidden z-[9999]"
        >
          <RadixSelect.ScrollUpButton className="flex items-center justify-center h-6 text-text-muted">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className="p-1">
            {safeOptions.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className="relative flex items-center px-3 py-2 text-[14px] text-text-primary rounded cursor-pointer outline-none hover:bg-background data-[highlighted]:bg-primary-tint data-[highlighted]:text-primary"
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className="flex items-center justify-center h-6 text-text-muted">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
