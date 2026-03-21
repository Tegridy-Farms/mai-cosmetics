'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatAmount } from '@/lib/format';
import { t } from '@/lib/translations';

export type IncomeEligibleAddon = { id: number; name: string; price: number };

interface IncomeAddonsPanelProps {
  eligibleAddons: IncomeEligibleAddon[];
  addonQuantities: Record<number, number>;
  onQtyChange: (addonId: number, qty: number) => void;
  baseAmount: number;
  addonsTotal: number;
  suggestedTotal: number;
  amountTouched: boolean;
  onSyncPrice: () => void;
  isLoading: boolean;
  isSubmitting: boolean;
}

export function IncomeAddonsPanel({
  eligibleAddons,
  addonQuantities,
  onQtyChange,
  baseAmount,
  addonsTotal,
  suggestedTotal,
  amountTouched,
  onSyncPrice,
  isLoading,
  isSubmitting,
}: IncomeAddonsPanelProps) {
  if (isLoading) {
    return (
      <div
        className="rounded-xl border border-border bg-background/40 px-4 py-4 animate-pulse"
        aria-busy="true"
      >
        <div className="h-4 w-32 bg-skeleton rounded mb-3" />
        <div className="h-10 bg-skeleton rounded" />
      </div>
    );
  }

  if (eligibleAddons.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background/30 px-4 py-4 text-center transition-colors">
        <p className="text-sm text-text-muted">{t.forms.incomeAddonsEmpty}</p>
        <Link
          href="/service-types"
          className="inline-block mt-2 text-sm text-primary underline hover:text-primary-dark"
        >
          {t.forms.incomeAddonsManage}
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-background/80 to-surface/90 px-4 py-4 shadow-sm space-y-4 transition-all duration-300 ease-out">
      <h3 className="text-sm font-semibold text-text-primary tracking-tight">
        {t.forms.incomeAddonsTitle}
      </h3>

      <ul className="space-y-3">
        {eligibleAddons.map((a) => {
          const qty = addonQuantities[a.id] ?? 0;
          return (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface/60 border border-border/60 px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-text-primary text-sm truncate">{a.name}</p>
                <p className="text-[12px] text-text-muted tabular-nums">₪{formatAmount(a.price)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  className="size-9 rounded-lg border border-border bg-background text-text-primary hover:bg-surface disabled:opacity-40 transition-colors text-lg leading-none font-medium"
                  aria-label="הפחתה"
                  disabled={isSubmitting || qty <= 0}
                  onClick={() => onQtyChange(a.id, Math.max(0, qty - 1))}
                >
                  −
                </button>
                <span className="w-8 text-center tabular-nums text-sm font-medium text-text-primary">
                  {qty}
                </span>
                <button
                  type="button"
                  className="size-9 rounded-lg border border-border bg-background text-text-primary hover:bg-surface disabled:opacity-40 transition-colors text-lg leading-none font-medium"
                  aria-label="הוספה"
                  disabled={isSubmitting}
                  onClick={() => onQtyChange(a.id, qty + 1)}
                >
                  +
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="pt-1 space-y-2 text-[13px] text-text-muted border-t border-border/60">
        <div className="flex justify-between gap-2">
          <span>{t.forms.incomeAddonBase}</span>
          <span className="tabular-nums text-text-primary">₪{formatAmount(baseAmount)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>{t.forms.incomeAddonExtras}</span>
          <span className="tabular-nums text-text-primary">₪{formatAmount(addonsTotal)}</span>
        </div>
        <div className="flex justify-between gap-2 font-medium text-text-primary">
          <span>{t.forms.incomeAddonSuggested}</span>
          <span className="tabular-nums">₪{formatAmount(suggestedTotal)}</span>
        </div>
        {amountTouched && (
          <Button
            type="button"
            variant="ghost"
            className="w-full mt-2 text-sm"
            disabled={isSubmitting}
            onClick={onSyncPrice}
          >
            {t.forms.incomeAddonSyncPrice}
          </Button>
        )}
      </div>
    </div>
  );
}
