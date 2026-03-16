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
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger
        id={id}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        className={`w-full h-[44px] px-3 flex items-center justify-between border rounded-[6px] outline-none transition-colors text-start ${
          error
            ? 'border-[#C81E1E] focus:ring-2 focus:ring-[#C81E1E] focus:border-[#C81E1E]'
            : 'border-[#E5E7EB] focus:ring-2 focus:ring-[#3F83F8] focus:border-[#3F83F8]'
        } disabled:bg-[#F9FAFB] disabled:cursor-not-allowed ${!value ? 'text-[#9CA3AF]' : 'text-[#111827]'}`}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="bg-white border border-[#E5E7EB] rounded-[6px] shadow-md overflow-hidden z-50">
          <RadixSelect.ScrollUpButton className="flex items-center justify-center h-6 text-[#6B7280]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className="relative flex items-center px-3 py-2 text-[14px] text-[#111827] rounded cursor-pointer outline-none hover:bg-[#F9FAFB] data-[highlighted]:bg-[#EBF5FF] data-[highlighted]:text-[#1A56DB]"
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className="flex items-center justify-center h-6 text-[#6B7280]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
