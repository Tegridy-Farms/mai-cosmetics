'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  total: number;
  page: number;
  pageSize?: number;
  onChange: (page: number) => void;
}

export function Pagination({ total, page, pageSize = 20, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between py-3 px-4">
      <span className="text-[12px] font-normal text-[#6B7280]">
        Showing {start}–{end} of {total} entries
      </span>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="min-w-[80px] h-[36px]"
        >
          ← Prev
        </Button>
        <Button
          variant="ghost"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="min-w-[80px] h-[36px]"
        >
          Next →
        </Button>
      </div>
    </div>
  );
}
