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
    .min(1, t.serviceTypes.nameRequired)
    .max(100, t.serviceTypes.nameMaxLength)
    .trim(),
  default_price: z
    .union([
      z.number().nonnegative(t.serviceTypes.defaultPriceInvalid),
      z.null(),
    ])
    .optional(),
});

type FormErrors = Partial<Record<keyof z.infer<typeof FormSchema>, string>>;

interface ServiceTypeFormProps {
  initialName?: string;
  initialDefaultPrice?: number | null;
  serviceTypeId?: number;
  onSuccess?: () => void;
}

export function ServiceTypeForm({
  initialName = '',
  initialDefaultPrice,
  serviceTypeId,
  onSuccess,
}: ServiceTypeFormProps) {
  const [name, setName] = useState(initialName);
  const [defaultPrice, setDefaultPrice] = useState(
    initialDefaultPrice != null ? String(initialDefaultPrice) : ''
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, toasts } = useToast();

  const isEdit = !!serviceTypeId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = defaultPrice.trim();
    const parsedDefaultPrice =
      trimmed === '' ? null : Number(trimmed);
    if (trimmed !== '' && (Number.isNaN(parsedDefaultPrice) || parsedDefaultPrice! < 0)) {
      setErrors({ default_price: t.serviceTypes.defaultPriceInvalid });
      return;
    }

    const rawData = {
      name: name.trim(),
      default_price: parsedDefaultPrice,
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
        ? `/api/service-types/${serviceTypeId}`
        : '/api/service-types';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.data.name,
          default_price: result.data.default_price ?? null,
        }),
      });

      if (!response.ok) {
        showToast(t.toast.couldNotSave, 'error');
        return;
      }

      showToast(t.serviceTypes.saved, 'success');

      if (onSuccess) {
        onSuccess();
      } else if (isEdit) {
        window.location.href = '/service-types';
      } else {
        setName('');
        setDefaultPrice('');
        window.location.href = '/service-types';
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
            <Label htmlFor="name">{t.serviceTypes.name}</Label>
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
            <Label htmlFor="default_price">
              {t.serviceTypes.defaultPrice}{' '}
              <span className="text-text-muted font-normal">
                ({t.serviceTypes.defaultPriceOptional})
              </span>
            </Label>
            <div className="relative">
              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none select-none">
                ₪
              </span>
              <Input
                id="default_price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(e.target.value)}
                error={!!errors.default_price}
                aria-invalid={errors.default_price ? 'true' : undefined}
                aria-describedby={
                  errors.default_price ? 'default_price-error' : undefined
                }
                disabled={isSubmitting}
                className="ps-7"
              />
            </div>
            {errors.default_price && (
              <p
                id="default_price-error"
                className="text-[12px] text-error mt-1"
              >
                {errors.default_price}
              </p>
            )}
          </div>

          <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
            {t.forms.save}
          </Button>

          <Link
            href="/service-types"
            className="block text-center text-primary underline hover:text-primary-dark text-sm transition-colors"
          >
            {t.serviceTypes.backToList}
          </Link>
        </div>
      </form>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
