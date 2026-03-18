'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CustomerCombobox, NEW_CUSTOMER_VALUE } from '@/components/ui/customer-combobox';
import { AddCustomerModal } from '@/components/modals/AddCustomerModal';
import { Label } from '@/components/ui/label';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { t } from '@/lib/translations';

function createFormSchema() {
  return z.object({
    service_name: z.string().min(1, t.forms.serviceNameRequired),
    service_type_id: z.string().min(1, t.forms.serviceTypeRequired),
    customer_id: z.string().optional(),
    date: z.string().min(1, t.forms.dateRequired),
    duration_minutes: z.number()
      .positive(t.forms.durationRequired)
      .int(t.forms.durationWhole),
    amount: z.number().positive(t.forms.amountRequired),
  });
}

const FormSchema = createFormSchema();

type FormErrors = Partial<Record<keyof z.infer<typeof FormSchema>, string>>;

interface ServiceType {
  id: number;
  name: string;
  default_price?: number | null;
}

interface IncomeFormProps {
  serviceTypes: ServiceType[];
  incomeId?: number;
  initialData?: {
    service_name: string;
    service_type_id: number;
    customer_id?: number | null;
    date: string;
    duration_minutes: number;
    amount: number;
  };
}

export function IncomeForm({
  serviceTypes,
  incomeId,
  initialData,
}: IncomeFormProps) {
  const isEdit = !!incomeId;
  const [serviceName, setServiceName] = useState(initialData?.service_name ?? '');
  const [serviceTypeId, setServiceTypeId] = useState(
    initialData?.service_type_id != null ? String(initialData.service_type_id) : ''
  );
  const [customerId, setCustomerId] = useState(
    initialData?.customer_id != null ? String(initialData.customer_id) : ''
  );
  const [date, setDate] = useState(
    initialData?.date ?? new Date().toISOString().split('T')[0]
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialData?.duration_minutes != null ? String(initialData.duration_minutes) : ''
  );
  const [amount, setAmount] = useState(
    initialData?.amount != null ? String(initialData.amount) : ''
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [pendingIncomeId, setPendingIncomeId] = useState<number | null>(null);
  const [savedIncomeData, setSavedIncomeData] = useState<{
    service_name: string;
    service_type_id: number;
    date: string;
    duration_minutes: number;
    amount: number;
  } | null>(null);
  const { showToast, toasts } = useToast();

  const [effectiveServiceTypes, setEffectiveServiceTypes] = useState<ServiceType[]>(serviceTypes ?? []);
  const [isLoadingServiceTypes, setIsLoadingServiceTypes] = useState(
    !serviceTypes?.length
  );

  useEffect(() => {
    const types = serviceTypes ?? [];
    if (types.length > 0) {
      setEffectiveServiceTypes(types);
      setIsLoadingServiceTypes(false);
    } else {
      setIsLoadingServiceTypes(true);
      fetch('/api/service-types')
        .then((r) => r.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setEffectiveServiceTypes(list);
        })
        .catch(() => {})
        .finally(() => setIsLoadingServiceTypes(false));
    }
  }, [serviceTypes]);

  const serviceTypeOptions = effectiveServiceTypes.map((st) => ({
    value: String(st.id),
    label: st.name,
  }));

  const handleServiceTypeChange = (value: string) => {
    setServiceTypeId(value);
    if (value) {
      const st = effectiveServiceTypes.find((s) => String(s.id) === value);
      if (st?.default_price != null && st.default_price > 0) {
        setAmount(String(st.default_price));
      }
    }
  };

  const handleAddCustomerSuccess = async (customer: { id: number }) => {
    if (pendingIncomeId == null || !savedIncomeData) return;
    try {
      const res = await fetch(`/api/income/${pendingIncomeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...savedIncomeData,
          customer_id: customer.id,
        }),
      });
      if (res.ok) {
        showToast(t.toast.incomeLogged, 'success');
        setShowAddCustomerModal(false);
        setPendingIncomeId(null);
        setSavedIncomeData(null);
        window.location.href = '/income';
      } else {
        showToast(t.toast.couldNotSave, 'error');
      }
    } catch {
      showToast(t.toast.couldNotSave, 'error');
    }
  };

  const handleAddCustomerClose = () => {
    setShowAddCustomerModal(false);
    setPendingIncomeId(null);
    setSavedIncomeData(null);
    window.location.href = '/income';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rawData = {
      service_name: serviceName,
      service_type_id: serviceTypeId,
      customer_id: customerId === NEW_CUSTOMER_VALUE ? undefined : customerId || undefined,
      date,
      duration_minutes: Number(durationMinutes),
      amount: Number(amount),
    };

    const result = FormSchema.safeParse(rawData);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const apiCustomerId =
        customerId && customerId !== NEW_CUSTOMER_VALUE ? Number(customerId) : null;

      const url = isEdit ? `/api/income/${incomeId}` : '/api/income';
      const method = isEdit ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_name: result.data.service_name,
          service_type_id: Number(result.data.service_type_id),
          customer_id: apiCustomerId,
          date: result.data.date,
          duration_minutes: result.data.duration_minutes,
          amount: result.data.amount,
        }),
      });

      if (!response.ok) {
        showToast(t.toast.couldNotSave, 'error');
        return;
      }

      if (customerId === NEW_CUSTOMER_VALUE && !isEdit) {
        const created = await response.json();
        setPendingIncomeId(created.id);
        setSavedIncomeData({
          service_name: result.data.service_name,
          service_type_id: Number(result.data.service_type_id),
          date: result.data.date,
          duration_minutes: result.data.duration_minutes,
          amount: result.data.amount,
        });
        setShowAddCustomerModal(true);
      } else {
        showToast(t.toast.incomeLogged, 'success');
        if (isEdit) {
          window.location.href = '/income';
          return;
        }
        setServiceName('');
        setServiceTypeId('');
        setCustomerId('');
        setDate(new Date().toISOString().split('T')[0]);
        setDurationMinutes('');
        setAmount('');
      }
    } catch {
      showToast(t.toast.couldNotSave, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        aria-busy={isSubmitting}
        className="bg-surface border border-border rounded-xl p-6 max-w-[560px] mx-auto shadow-sm"
      >
        <div className="flex flex-col gap-4">
          {/* Service Name */}
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

          {/* Service Type */}
          <div>
            <Label htmlFor="service_type_id">{t.forms.serviceType}</Label>
            {serviceTypeOptions.length > 0 ? (
              <Select
                key={`service-type-${effectiveServiceTypes.length}`}
                id="service_type_id"
                options={serviceTypeOptions}
                placeholder={t.forms.selectServiceType}
                value={serviceTypeId}
                onValueChange={handleServiceTypeChange}
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
                {isLoadingServiceTypes
                  ? t.common.loading
                  : t.serviceTypes.noServiceTypes}
              </div>
            )}
            {errors.service_type_id && (
              <p id="service_type_id-error" className="text-[12px] text-error mt-1">
                {errors.service_type_id}
              </p>
            )}
          </div>

          {/* Customer (optional) */}
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

          {/* Date */}
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

          {/* Duration */}
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

          {/* Amount */}
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
                onChange={(e) => setAmount(e.target.value)}
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
      </form>

      <AddCustomerModal
        isOpen={showAddCustomerModal}
        onClose={handleAddCustomerClose}
        onSuccess={handleAddCustomerSuccess}
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
}
