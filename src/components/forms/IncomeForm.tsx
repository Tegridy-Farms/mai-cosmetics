'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast, ToastContainer } from '@/components/ui/toast';

const FormSchema = z.object({
  service_name: z.string().min(1, 'Service name is required'),
  service_type_id: z.string().min(1, 'Service type is required'),
  date: z.string().min(1, 'Date is required'),
  duration_minutes: z.number().positive('Duration must be greater than 0 minutes').int('Duration must be a whole number'),
  amount: z.number().positive('Amount must be greater than 0'),
});

type FormErrors = Partial<Record<keyof z.infer<typeof FormSchema>, string>>;

interface ServiceType {
  id: number;
  name: string;
}

interface IncomeFormProps {
  serviceTypes: ServiceType[];
}

export function IncomeForm({ serviceTypes }: IncomeFormProps) {
  const [serviceName, setServiceName] = useState('');
  const [serviceTypeId, setServiceTypeId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, toasts } = useToast();

  const serviceTypeOptions = serviceTypes.map((st) => ({
    value: String(st.id),
    label: st.name,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rawData = {
      service_name: serviceName,
      service_type_id: serviceTypeId,
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
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_name: result.data.service_name,
          service_type_id: Number(result.data.service_type_id),
          date: result.data.date,
          duration_minutes: result.data.duration_minutes,
          amount: result.data.amount,
        }),
      });

      if (!response.ok) {
        showToast('Could not save. Please try again.', 'error');
        return;
      }

      showToast('Income logged', 'success');
      setServiceName('');
      setServiceTypeId('');
      setDate(new Date().toISOString().split('T')[0]);
      setDurationMinutes('');
      setAmount('');
    } catch {
      showToast('Could not save. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        aria-busy={isSubmitting}
        className="bg-white border border-[#E5E7EB] rounded-[8px] p-6 max-w-[560px] mx-auto"
      >
        <div className="flex flex-col gap-4">
          {/* Service Name */}
          <div>
            <Label htmlFor="service_name">Service Name</Label>
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
              <p id="service_name-error" className="text-[12px] text-[#C81E1E] mt-1">
                {errors.service_name}
              </p>
            )}
          </div>

          {/* Service Type */}
          <div>
            <Label htmlFor="service_type_id">Service Type</Label>
            <Select
              id="service_type_id"
              options={serviceTypeOptions}
              placeholder="Select service type"
              value={serviceTypeId}
              onValueChange={setServiceTypeId}
              error={!!errors.service_type_id}
              aria-invalid={errors.service_type_id ? 'true' : undefined}
              aria-describedby={errors.service_type_id ? 'service_type_id-error' : undefined}
              disabled={isSubmitting}
            />
            {errors.service_type_id && (
              <p id="service_type_id-error" className="text-[12px] text-[#C81E1E] mt-1">
                {errors.service_type_id}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date">Date</Label>
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
              <p id="date-error" className="text-[12px] text-[#C81E1E] mt-1">
                {errors.date}
              </p>
            )}
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="duration_minutes">Duration (min)</Label>
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
              <p id="duration_minutes-error" className="text-[12px] text-[#C81E1E] mt-1">
                {errors.duration_minutes}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount">Amount (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none select-none">
                $
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
                className="pl-7"
              />
            </div>
            {errors.amount && (
              <p id="amount-error" className="text-[12px] text-[#C81E1E] mt-1">
                {errors.amount}
              </p>
            )}
          </div>

          <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
            Save
          </Button>

          <Link
            href="/"
            className="block text-center text-[#1A56DB] underline hover:text-[#1E429F] text-sm"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </form>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
