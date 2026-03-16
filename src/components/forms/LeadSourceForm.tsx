'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { t } from '@/lib/translations';

const FormSchema = z.object({
  name: z
    .string()
    .min(1, t.leadSources.nameRequired)
    .max(100, t.leadSources.nameMaxLength)
    .trim(),
  sort_order: z.number().int().nonnegative().optional().default(0),
});

type FormErrors = Partial<Record<keyof z.infer<typeof FormSchema>, string>>;

interface LeadSourceFormProps {
  initialName?: string;
  initialSortOrder?: number;
  leadSourceId?: number;
  onSuccess?: () => void;
}

export function LeadSourceForm({
  initialName = '',
  initialSortOrder = 0,
  leadSourceId,
  onSuccess,
}: LeadSourceFormProps) {
  const [name, setName] = useState(initialName);
  const [sortOrder, setSortOrder] = useState(String(initialSortOrder));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, toasts } = useToast();

  const isEdit = !!leadSourceId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedSortOrder = sortOrder.trim() === '' ? 0 : parseInt(sortOrder, 10);
    if (
      sortOrder.trim() !== '' &&
      (Number.isNaN(parsedSortOrder) || parsedSortOrder < 0)
    ) {
      setErrors({ sort_order: t.leadSources.nameRequired });
      return;
    }

    const rawData = {
      name: name.trim(),
      sort_order: parsedSortOrder,
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
      const url = isEdit
        ? `/api/lead-sources/${leadSourceId}`
        : '/api/lead-sources';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.data.name,
          sort_order: result.data.sort_order,
        }),
      });

      if (!response.ok) {
        showToast(t.toast.couldNotSave, 'error');
        return;
      }

      showToast(t.leadSources.saved, 'success');

      if (onSuccess) {
        onSuccess();
      } else if (isEdit) {
        window.location.href = '/customers/lead-sources';
      } else {
        setName('');
        setSortOrder('0');
        window.location.href = '/customers/lead-sources';
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
          <div>
            <Label htmlFor="name">{t.leadSources.name}</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              aria-invalid={errors.name ? 'true' : undefined}
              aria-describedby={errors.name ? 'name-error' : undefined}
              disabled={isSubmitting}
              maxLength={100}
            />
            {errors.name && (
              <p id="name-error" className="text-[12px] text-error mt-1">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="sort_order">{t.leadSources.sortOrder}</Label>
            <Input
              id="sort_order"
              type="number"
              min="0"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              error={!!errors.sort_order}
              aria-invalid={errors.sort_order ? 'true' : undefined}
              disabled={isSubmitting}
            />
            {errors.sort_order && (
              <p id="sort_order-error" className="text-[12px] text-error mt-1">
                {errors.sort_order}
              </p>
            )}
          </div>

          <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
            {t.forms.save}
          </Button>

          <Link
            href="/customers/lead-sources"
            className="block text-center text-primary underline hover:text-primary-dark text-sm transition-colors"
          >
            {t.leadSources.backToList}
          </Link>
        </div>
      </form>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
