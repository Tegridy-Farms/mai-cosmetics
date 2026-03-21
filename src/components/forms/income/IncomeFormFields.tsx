'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CustomerCombobox, NEW_CUSTOMER_VALUE } from '@/components/ui/customer-combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { t } from '@/lib/translations';
import { IncomeAddonsPanel, type IncomeEligibleAddon } from '@/components/forms/income/IncomeAddonsPanel';

export type IncomeFormErrors = Partial<
  Record<'service_name' | 'service_type_id' | 'date' | 'duration_minutes' | 'amount' | 'comment', string>
>;

export type IncomeFormAddonsPanelProps = {
  eligibleAddons: IncomeEligibleAddon[];
  addonQuantities: Record<number, number>;
  onQtyChange: (addonId: number, qty: number) => void;
  baseAmount: number;
  addonsTotal: number;
  suggestedTotal: number;
  amountTouched: boolean;
  onSyncPrice: () => void;
  isLoading: boolean;
};

interface IncomeFormFieldsProps {
  serviceName: string;
  setServiceName: (v: string) => void;
  serviceTypeId: string;
  serviceTypeOptions: { value: string; label: string }[];
  onServiceTypeChange: (value: string) => void;
  customerId: string;
  setCustomerId: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  durationMinutes: string;
  setDurationMinutes: (v: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  onAmountUserEdit?: () => void;
  comment: string;
  setComment: (v: string) => void;
  errors: IncomeFormErrors;
  isSubmitting: boolean;
  isEdit: boolean;
  isLoadingServiceTypes: boolean;
  serviceTypesCount: number;
  addonsPanel: IncomeFormAddonsPanelProps | null;
}

export function IncomeFormFields({
  serviceName,
  setServiceName,
  serviceTypeId,
  serviceTypeOptions,
  onServiceTypeChange,
  customerId,
  setCustomerId,
  date,
  setDate,
  durationMinutes,
  setDurationMinutes,
  amount,
  setAmount,
  onAmountUserEdit,
  comment,
  setComment,
  errors,
  isSubmitting,
  isEdit,
  isLoadingServiceTypes,
  serviceTypesCount,
  addonsPanel,
}: IncomeFormFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label htmlFor="service_name">{t.forms.serviceName}</Label>
        <Input
          id="service_name"
          type="text"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          error={!!errors.service_name}
          aria-invalid={errors.service_name ? 'true' : undefined}
          aria-describedby={errors.service_name ? 'service_name-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.service_name && (
          <p id="service_name-error" className="text-[12px] text-error mt-1">
            {errors.service_name}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="service_type_id">{t.forms.serviceType}</Label>
        {serviceTypeOptions.length > 0 ? (
          <Select
            key={`service-type-${serviceTypesCount}`}
            id="service_type_id"
            options={serviceTypeOptions}
            placeholder={t.forms.selectServiceType}
            value={serviceTypeId}
            onValueChange={onServiceTypeChange}
            error={!!errors.service_type_id}
            aria-invalid={errors.service_type_id ? 'true' : undefined}
            aria-describedby={errors.service_type_id ? 'service_type_id-error' : undefined}
            disabled={isSubmitting}
          />
        ) : (
          <div
            id="service_type_id"
            className="h-[44px] px-3 flex items-center border border-border rounded-[10px] bg-background text-text-muted text-sm"
          >
            {isLoadingServiceTypes ? t.common.loading : t.serviceTypes.noServiceTypes}
          </div>
        )}
        {errors.service_type_id && (
          <p id="service_type_id-error" className="text-[12px] text-error mt-1">
            {errors.service_type_id}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="customer_id">
          {t.forms.customer}{' '}
          <span className="text-text-muted font-normal">({t.forms.selectCustomer})</span>
        </Label>
        <CustomerCombobox
          id="customer_id"
          value={customerId}
          onValueChange={(id) => setCustomerId(id)}
          onAddNew={!isEdit ? () => setCustomerId(NEW_CUSTOMER_VALUE) : undefined}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="date">{t.forms.date}</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={!!errors.date}
          aria-invalid={errors.date ? 'true' : undefined}
          aria-describedby={errors.date ? 'date-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.date && (
          <p id="date-error" className="text-[12px] text-error mt-1">
            {errors.date}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="duration_minutes">{t.forms.durationMin}</Label>
        <Input
          id="duration_minutes"
          type="number"
          min="1"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          error={!!errors.duration_minutes}
          aria-invalid={errors.duration_minutes ? 'true' : undefined}
          aria-describedby={errors.duration_minutes ? 'duration_minutes-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.duration_minutes && (
          <p id="duration_minutes-error" className="text-[12px] text-error mt-1">
            {errors.duration_minutes}
          </p>
        )}
      </div>

      {addonsPanel && (
        <IncomeAddonsPanel
          eligibleAddons={addonsPanel.eligibleAddons}
          addonQuantities={addonsPanel.addonQuantities}
          onQtyChange={addonsPanel.onQtyChange}
          baseAmount={addonsPanel.baseAmount}
          addonsTotal={addonsPanel.addonsTotal}
          suggestedTotal={addonsPanel.suggestedTotal}
          amountTouched={addonsPanel.amountTouched}
          onSyncPrice={addonsPanel.onSyncPrice}
          isLoading={addonsPanel.isLoading}
          isSubmitting={isSubmitting}
        />
      )}

      <div>
        <Label htmlFor="amount">{t.forms.amountIls}</Label>
        <div className="relative">
          <span className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none select-none">
            ₪
          </span>
          <Input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onFocus={() => onAmountUserEdit?.()}
            onChange={(e) => {
              onAmountUserEdit?.();
              setAmount(e.target.value);
            }}
            error={!!errors.amount}
            aria-invalid={errors.amount ? 'true' : undefined}
            aria-describedby={errors.amount ? 'amount-error' : undefined}
            disabled={isSubmitting}
            className="ps-7"
          />
        </div>
        {errors.amount && (
          <p id="amount-error" className="text-[12px] text-error mt-1">
            {errors.amount}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="income_comment">
          {t.forms.incomeComment}{' '}
          <span className="text-text-muted font-normal">({t.forms.incomeCommentHint})</span>
        </Label>
        <textarea
          id="income_comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={2000}
          disabled={isSubmitting}
          aria-invalid={errors.comment ? 'true' : undefined}
          aria-describedby={errors.comment ? 'income_comment-error' : undefined}
          className={`w-full min-h-[88px] px-3 py-2 border rounded-lg outline-none transition-colors resize-y ${
            errors.comment
              ? 'border-error focus:ring-2 focus:ring-error focus:border-error'
              : 'border-border focus:ring-2 focus:ring-focusRing focus:border-focusRing'
          } disabled:bg-background disabled:cursor-not-allowed`}
        />
        {errors.comment && (
          <p id="income_comment-error" className="text-[12px] text-error mt-1">
            {errors.comment}
          </p>
        )}
      </div>

      <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
        {t.forms.save}
      </Button>

      <Link
        href="/income"
        className="block text-center text-primary underline hover:text-primary-dark text-sm transition-colors"
      >
        {t.pages.backToIncome}
      </Link>
    </div>
  );
}
