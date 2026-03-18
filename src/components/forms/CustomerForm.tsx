'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { t } from '@/lib/translations';
import type { LeadSource } from '@/types';

const FormSchema = z.object({
  first_name: z.string().min(1, t.customers.firstNameRequired).max(100).trim(),
  last_name: z.string().min(1, t.customers.lastNameRequired).max(100).trim(),
  phone: z.string().max(20).trim().optional().or(z.literal('')),
  email: z
    .string()
    .max(255)
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((s) => !s || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s), 'Invalid email'),
  lead_source_id: z.string().optional().transform((v) => (v ? Number(v) : null)),
});

type FormErrors = Partial<Record<keyof z.infer<typeof FormSchema>, string>>;

interface CustomerFormProps {
  initialFirstName?: string;
  initialLastName?: string;
  initialPhone?: string;
  initialEmail?: string;
  initialLeadSourceId?: number | null;
  customerId?: number;
  leadSources: LeadSource[];
  onSuccess?: (customer?: { id: number }) => void;
  hideBackLink?: boolean;
}

export function CustomerForm({
  initialFirstName = '',
  initialLastName = '',
  initialPhone = '',
  initialEmail = '',
  initialLeadSourceId,
  customerId,
  leadSources,
  onSuccess,
  hideBackLink = false,
}: CustomerFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState(initialEmail);
  const [leadSourceId, setLeadSourceId] = useState(
    initialLeadSourceId != null ? String(initialLeadSourceId) : ''
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, toasts } = useToast();

  const isEdit = !!customerId;

  const leadSourceOptions = leadSources.map((ls) => ({
    value: String(ls.id),
    label: ls.name,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rawData = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      lead_source_id: leadSourceId || undefined,
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
      const url = isEdit ? `/api/customers/${customerId}` : '/api/customers';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: result.data.first_name,
          last_name: result.data.last_name,
          phone: result.data.phone || null,
          email: result.data.email || null,
          lead_source_id: result.data.lead_source_id,
        }),
      });

      if (!response.ok) {
        showToast(t.toast.couldNotSave, 'error');
        return;
      }

      showToast(t.customers.saved, 'success');

      if (onSuccess) {
        const data = await response.json();
        onSuccess(data?.id ? { id: data.id } : undefined);
      } else if (isEdit) {
        window.location.href = '/customers';
      } else {
        setFirstName('');
        setLastName('');
        setPhone('');
        setEmail('');
        setLeadSourceId('');
        window.location.href = '/customers';
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">{t.forms.firstName}</Label>
              <Input
                id="first_name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={!!errors.first_name}
                aria-invalid={errors.first_name ? 'true' : undefined}
                disabled={isSubmitting}
                maxLength={100}
              />
              {errors.first_name && (
                <p id="first_name-error" className="text-[12px] text-error mt-1">
                  {errors.first_name}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="last_name">{t.forms.lastName}</Label>
              <Input
                id="last_name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={!!errors.last_name}
                aria-invalid={errors.last_name ? 'true' : undefined}
                disabled={isSubmitting}
                maxLength={100}
              />
              {errors.last_name && (
                <p id="last_name-error" className="text-[12px] text-error mt-1">
                  {errors.last_name}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="phone">
              {t.forms.phone}{' '}
              <span className="font-normal text-text-muted">({t.forms.customerOptional})</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={!!errors.phone}
              disabled={isSubmitting}
              maxLength={20}
            />
          </div>

          <div>
            <Label htmlFor="email">
              {t.forms.email}{' '}
              <span className="font-normal text-text-muted">({t.forms.customerOptional})</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              disabled={isSubmitting}
              maxLength={255}
            />
            {errors.email && (
              <p id="email-error" className="text-[12px] text-error mt-1">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="lead_source_id">{t.forms.leadSource}</Label>
            <Select
              id="lead_source_id"
              options={leadSourceOptions}
              placeholder={t.forms.selectLeadSource}
              value={leadSourceId}
              onValueChange={setLeadSourceId}
              disabled={isSubmitting}
            />
          </div>

          <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
            {t.forms.save}
          </Button>

          {!hideBackLink && (
            <Link
              href="/customers"
              className="block text-center text-primary underline hover:text-primary-dark text-sm transition-colors"
            >
              {t.customers.backToList}
            </Link>
          )}
        </div>
      </form>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
