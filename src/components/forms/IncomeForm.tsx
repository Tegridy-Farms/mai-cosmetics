'use client';

import React, { useState } from 'react';
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
  comment?: string | null;
};

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
    comment: string | null;
  } | null>(null);
  const { showToast, toasts } = useToast();
  const { effectiveServiceTypes, isLoadingServiceTypes } = useIncomeServiceTypes(serviceTypes ?? []);

  const serviceTypeOptions = effectiveServiceTypes.map((st) => ({
    value: String(st.id),
    label: st.name,
  }));

  const handleServiceTypeChange = (value: string) => {
    setServiceTypeId(value);
    if (value) {
      const st = effectiveServiceTypes.find((s) => String(s.id) === value);
      if (st) {
        if (st.default_price != null && st.default_price > 0) {
          setAmount(String(st.default_price));
        }
        if (st.default_duration != null && st.default_duration > 0) {
          setDurationMinutes(String(st.default_duration));
        }
      }
    }
  };

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

      const payload = {
        service_name: result.data.service_name,
        service_type_id: Number(result.data.service_type_id),
        customer_id: apiCustomerId,
        date: result.data.date,
        duration_minutes: result.data.duration_minutes,
        amount: result.data.amount,
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
          comment={comment}
          setComment={setComment}
          errors={errors}
          isSubmitting={isSubmitting}
          isEdit={isEdit}
          isLoadingServiceTypes={isLoadingServiceTypes}
          serviceTypesCount={effectiveServiceTypes.length}
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
