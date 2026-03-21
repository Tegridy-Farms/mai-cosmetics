'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AddCustomerModal } from '@/components/modals/AddCustomerModal';
import { IncomeFormFields } from '@/components/forms/income/IncomeFormFields';
import { useIncomeServiceTypes } from '@/components/forms/income/useIncomeServiceTypes';
import { NEW_CUSTOMER_VALUE } from '@/components/ui/customer-combobox';
import { ToastContainer, useToast } from '@/components/ui/toast';
import { ClientApiError, postJson, putJson } from '@/lib/api-client';
import { showToastForClientApiError } from '@/lib/api-error-toast';
import { t } from '@/lib/translations';
import { IncomeFormClientSchema } from '@/lib/validation/income';
import { zodIssuesToFieldErrors } from '@/lib/zod-field-errors';
import type { IncomeEligibleAddon } from '@/components/forms/income/IncomeAddonsPanel';
import type { IncomeFormErrors } from '@/components/forms/income/IncomeFormFields';

interface ServiceType {
  id: number;
  name: string;
  default_price?: number | null;
  default_duration?: number | null;
}

export type IncomeFormInitialData = {
  service_name?: string;
  service_type_id?: number;
  customer_id?: number | null;
  date?: string;
  duration_minutes?: number;
  amount?: number;
  applied_addon_ids?: number[];
  comment?: string | null;
};

function countsFromAppliedIds(ids?: number[] | null): Record<number, number> {
  const m: Record<number, number> = {};
  if (!ids || !Array.isArray(ids)) return m;
  for (const id of ids) {
    if (typeof id === 'number' && id > 0) {
      m[id] = (m[id] ?? 0) + 1;
    }
  }
  return m;
}

function flattenAddonQuantities(quantities: Record<number, number>): number[] {
  const out: number[] = [];
  for (const [idStr, n] of Object.entries(quantities)) {
    const id = Number(idStr);
    const count = Math.floor(Number(n));
    if (!Number.isInteger(id) || id < 1 || !Number.isFinite(count) || count < 1) continue;
    for (let i = 0; i < count; i++) out.push(id);
  }
  return out;
}

function roundMoney(n: number): string {
  return String(Math.round(n * 100) / 100);
}

interface IncomeFormProps {
  serviceTypes: ServiceType[];
  incomeId?: number;
  initialData?: IncomeFormInitialData;
}

export function IncomeForm({ serviceTypes, incomeId, initialData }: IncomeFormProps) {
  const isEdit = !!incomeId;
  const [serviceName, setServiceName] = useState(initialData?.service_name ?? '');
  const [serviceTypeId, setServiceTypeId] = useState(
    initialData?.service_type_id != null ? String(initialData.service_type_id) : ''
  );
  const [customerId, setCustomerId] = useState(
    initialData?.customer_id != null ? String(initialData.customer_id) : ''
  );
  const [date, setDate] = useState(initialData?.date ?? new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState(
    initialData?.duration_minutes != null ? String(initialData.duration_minutes) : ''
  );
  const [amount, setAmount] = useState(initialData?.amount != null ? String(initialData.amount) : '');
  const [comment, setComment] = useState(initialData?.comment ?? '');
  const [addonQuantities, setAddonQuantities] = useState<Record<number, number>>(() =>
    countsFromAppliedIds(initialData?.applied_addon_ids)
  );
  const [eligibleAddons, setEligibleAddons] = useState<IncomeEligibleAddon[]>([]);
  const [loadingAddons, setLoadingAddons] = useState(
    () =>
      initialData?.service_type_id != null &&
      Number.isFinite(Number(initialData.service_type_id)) &&
      Number(initialData.service_type_id) > 0
  );
  const [amountDirty, setAmountDirty] = useState(false);
  const [errors, setErrors] = useState<IncomeFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [pendingIncomeId, setPendingIncomeId] = useState<number | null>(null);
  const [savedIncomeData, setSavedIncomeData] = useState<{
    service_name: string;
    service_type_id: number;
    date: string;
    duration_minutes: number;
    amount: number;
    applied_addon_ids: number[];
    comment: string | null;
  } | null>(null);
  const { showToast, toasts } = useToast();
  const { effectiveServiceTypes, isLoadingServiceTypes } = useIncomeServiceTypes(serviceTypes ?? []);

  const serviceTypeOptions = effectiveServiceTypes.map((st) => ({
    value: String(st.id),
    label: st.name,
  }));

  const selectedServiceType = useMemo(
    () => effectiveServiceTypes.find((s) => String(s.id) === serviceTypeId),
    [effectiveServiceTypes, serviceTypeId]
  );

  const baseAmount = useMemo(() => {
    const p = selectedServiceType?.default_price;
    if (p != null && Number(p) > 0) return Number(p);
    return 0;
  }, [selectedServiceType]);

  const addonsTotal = useMemo(() => {
    return eligibleAddons.reduce((sum, a) => {
      const q = addonQuantities[a.id] ?? 0;
      return sum + q * a.price;
    }, 0);
  }, [eligibleAddons, addonQuantities]);

  const suggestedTotal = baseAmount + addonsTotal;

  useEffect(() => {
    if (!serviceTypeId) {
      setEligibleAddons([]);
      setLoadingAddons(false);
      return;
    }

    const ac = new AbortController();
    setLoadingAddons(true);
    fetch(`/api/addons?service_type_id=${encodeURIComponent(serviceTypeId)}`, {
      signal: ac.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setEligibleAddons(
          list.map((x: { id: number; name: string; price: number | string }) => ({
            id: x.id,
            name: x.name,
            price: Number(x.price),
          }))
        );
      })
      .catch(() => {
        if (!ac.signal.aborted) setEligibleAddons([]);
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoadingAddons(false);
      });

    return () => ac.abort();
  }, [serviceTypeId]);

  useEffect(() => {
    if (!serviceTypeId || loadingAddons || amountDirty) return;
    if (suggestedTotal > 0) {
      setAmount(roundMoney(suggestedTotal));
    }
  }, [
    serviceTypeId,
    loadingAddons,
    amountDirty,
    suggestedTotal,
  ]);

  const handleAddonQtyChange = useCallback((addonId: number, qty: number) => {
    setAddonQuantities((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[addonId];
      else next[addonId] = qty;
      return next;
    });
  }, []);

  const handleSyncPrice = useCallback(() => {
    setAmountDirty(false);
    if (suggestedTotal > 0) {
      setAmount(roundMoney(suggestedTotal));
    }
  }, [suggestedTotal]);

  const handleServiceTypeChange = (value: string) => {
    setServiceTypeId(value);
    setAddonQuantities({});
    setAmountDirty(false);
    if (value) {
      setLoadingAddons(true);
      const st = effectiveServiceTypes.find((s) => String(s.id) === value);
      if (st) {
        if (st.default_price != null && st.default_price > 0) {
          setAmount(String(st.default_price));
        }
        if (st.default_duration != null && st.default_duration > 0) {
          setDurationMinutes(String(st.default_duration));
        }
      }
    } else {
      setLoadingAddons(false);
      setEligibleAddons([]);
    }
  };

  const handleAmountUserEdit = useCallback(() => {
    setAmountDirty(true);
  }, []);

  const handleAddCustomerSuccess = async (customer: { id: number }) => {
    if (pendingIncomeId == null || !savedIncomeData) return;
    try {
      await putJson(`/api/income/${pendingIncomeId}`, {
        ...savedIncomeData,
        customer_id: customer.id,
      });
      showToast(t.toast.incomeLogged, 'success');
      setShowAddCustomerModal(false);
      setPendingIncomeId(null);
      setSavedIncomeData(null);
      window.location.href = '/income';
    } catch (e) {
      if (e instanceof ClientApiError) {
        showToastForClientApiError(e, showToast);
      } else {
        showToast(t.toast.couldNotSave, 'error');
      }
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
      duration_minutes: durationMinutes,
      amount,
      comment: comment.trim() === '' ? undefined : comment,
    };

    const result = IncomeFormClientSchema.safeParse(rawData);

    if (!result.success) {
      setErrors(zodIssuesToFieldErrors(result.error.issues) as IncomeFormErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const apiCustomerId =
        customerId && customerId !== NEW_CUSTOMER_VALUE ? Number(customerId) : null;

      const commentPayload =
        result.data.comment != null && result.data.comment.trim() !== ''
          ? result.data.comment.trim()
          : null;

      const validAddonIdSet = new Set(eligibleAddons.map((a) => a.id));
      const applied_addon_ids = flattenAddonQuantities(addonQuantities).filter((id) =>
        validAddonIdSet.has(id)
      );

      const payload = {
        service_name: result.data.service_name,
        service_type_id: Number(result.data.service_type_id),
        customer_id: apiCustomerId,
        date: result.data.date,
        duration_minutes: result.data.duration_minutes,
        amount: result.data.amount,
        applied_addon_ids,
        comment: commentPayload,
      };

      if (isEdit) {
        await putJson(`/api/income/${incomeId}`, payload);
        showToast(t.toast.incomeLogged, 'success');
        window.location.href = '/income';
        return;
      }

      const created = await postJson<{ id: number }>('/api/income', payload);

      if (customerId === NEW_CUSTOMER_VALUE) {
        setPendingIncomeId(created.id);
        setSavedIncomeData({
          service_name: result.data.service_name,
          service_type_id: Number(result.data.service_type_id),
          date: result.data.date,
          duration_minutes: result.data.duration_minutes,
          amount: result.data.amount,
          applied_addon_ids,
          comment: commentPayload,
        });
        setShowAddCustomerModal(true);
      } else {
        showToast(t.toast.incomeLogged, 'success');
        setServiceName('');
        setServiceTypeId('');
        setCustomerId('');
        setDate(new Date().toISOString().split('T')[0]);
        setDurationMinutes('');
        setAmount('');
        setComment('');
        setAddonQuantities({});
        setAmountDirty(false);
      }
    } catch (err) {
      if (err instanceof ClientApiError) {
        showToastForClientApiError(err, showToast);
        if (err.body.details) {
          setErrors(zodIssuesToFieldErrors(err.body.details) as IncomeFormErrors);
        }
      } else {
        showToast(t.toast.couldNotSave, 'error');
      }
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
        <IncomeFormFields
          serviceName={serviceName}
          setServiceName={setServiceName}
          serviceTypeId={serviceTypeId}
          serviceTypeOptions={serviceTypeOptions}
          onServiceTypeChange={handleServiceTypeChange}
          customerId={customerId}
          setCustomerId={setCustomerId}
          date={date}
          setDate={setDate}
          durationMinutes={durationMinutes}
          setDurationMinutes={setDurationMinutes}
          amount={amount}
          setAmount={setAmount}
          onAmountUserEdit={handleAmountUserEdit}
          comment={comment}
          setComment={setComment}
          errors={errors}
          isSubmitting={isSubmitting}
          isEdit={isEdit}
          isLoadingServiceTypes={isLoadingServiceTypes}
          serviceTypesCount={effectiveServiceTypes.length}
          addonsPanel={
            serviceTypeId
              ? {
                  eligibleAddons,
                  addonQuantities,
                  onQtyChange: handleAddonQtyChange,
                  baseAmount,
                  addonsTotal,
                  suggestedTotal,
                  amountTouched: amountDirty,
                  onSyncPrice: handleSyncPrice,
                  isLoading: loadingAddons,
                }
              : null
          }
        />
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
