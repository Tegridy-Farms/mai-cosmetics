'use client';

import React from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/empty-state';
import { formatAmount } from '@/lib/format';
import { t } from '@/lib/translations';
import type { Addon, ServiceType } from '@/types';

interface AddonsTableProps {
  addons: Addon[];
  serviceTypes: ServiceType[];
  isLoading: boolean;
  onDelete: (id: number) => void;
}

const SKELETON_ROWS = 4;

function linkedTypeNames(serviceTypeIds: number[], serviceTypes: ServiceType[]): string {
  if (serviceTypeIds.length === 0) return t.serviceTypes.addons.noneLinked;
  const byId = new Map(serviceTypes.map((st) => [st.id, st.name]));
  return serviceTypeIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .join('، ');
}

export function AddonsTable({ addons, serviceTypes, isLoading, onDelete }: AddonsTableProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
          <div key={i} className="h-10 bg-skeleton rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (addons.length === 0) {
    return (
      <div className="py-10">
        <EmptyState
          title={t.serviceTypes.addons.noAddons}
          description={t.serviceTypes.addons.tryAdding}
          ctaLabel={t.serviceTypes.addons.addAddon}
          ctaHref="/service-types/addons/new"
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-start">
        <thead className="border-b border-border">
          <tr>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted">
              {t.serviceTypes.name}
            </th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted whitespace-nowrap">
              {t.serviceTypes.addons.price}
            </th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted min-w-[140px]">
              {t.serviceTypes.addons.linkedTypes}
            </th>
            <th scope="col" className="py-3 px-4 font-medium text-text-muted w-32">
              {/* actions */}
            </th>
          </tr>
        </thead>
        <tbody>
          {addons.map((a) => (
            <tr key={a.id} className="border-b border-border last:border-0 hover:bg-background/60 transition-colors">
              <td className="py-3 px-4 font-medium text-text-primary">{a.name}</td>
              <td className="py-3 px-4 tabular-nums">₪{formatAmount(Number(a.price))}</td>
              <td className="py-3 px-4 text-text-muted text-[13px] leading-snug">
                {linkedTypeNames(a.service_type_ids ?? [], serviceTypes)}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1 justify-end">
                  <Link
                    href={`/service-types/addons/${a.id}/edit`}
                    className="p-2 -m-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-text-muted hover:text-primary transition-colors touch-manipulation"
                    aria-label={`עריכת ${a.name}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(a.id)}
                    className="p-2 -m-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-text-muted hover:text-error transition-colors touch-manipulation"
                    aria-label={`מחיקת ${a.name}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
