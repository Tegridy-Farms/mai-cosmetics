'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { t } from '@/lib/translations';
import type { ServiceType } from '@/types';

const FormSchema = z.object({
  name: z
    .string()
    .min(1, t.serviceTypes.addons.nameRequired)
    .max(100, t.serviceTypes.nameMaxLength)
    .trim(),
  price: z.number().positive(t.serviceTypes.addons.priceInvalid),
});

type FormErrors = Partial<Record<keyof z.infer<typeof FormSchema> | 'service_types', string>>;

interface AddonFormProps {
  serviceTypes: ServiceType[];
  initialName?: string;
  initialPrice?: number;
  initialServiceTypeIds?: number[];
  addonId?: number;
  onSuccess?: () => void;
}

export function AddonForm({
  serviceTypes,
  initialName = '',
  initialPrice,
  initialServiceTypeIds = [],
  addonId,
  onSuccess,
}: AddonFormProps) {
  const [name, setName] = useState(initialName);
  const [price, setPrice] = useState(initialPrice != null ? String(initialPrice) : '');
  const [selectedTypeIds, setSelectedTypeIds] = useState<Set<number>>(
    () => new Set(initialServiceTypeIds)
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, toasts } = useToast();

  const isEdit = !!addonId;

  const toggleType = (id: number) => {
    setSelectedTypeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedPrice = price.trim();
    const parsedPrice = trimmedPrice === '' ? NaN : Number(trimmedPrice);
    if (trimmedPrice === '' || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrors({ price: t.serviceTypes.addons.priceRequired });
      return;
    }

    const rawData = {
      name: name.trim(),
      price: parsedPrice,
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

    const service_type_ids = [...selectedTypeIds].sort((a, b) => a - b);

    try {
      const url = isEdit ? `/api/addons/${addonId}` : '/api/addons';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.data.name,
          price: result.data.price,
          service_type_ids,
        }),
      });

      if (!response.ok) {
        showToast(t.toast.couldNotSave, 'error');
        return;
      }

      showToast(t.serviceTypes.addons.saved, 'success');

      if (onSuccess) {
        onSuccess();
      } else if (!isEdit) {
        setName('');
        setPrice('');
        setSelectedTypeIds(new Set());
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
        className="bg-surface border border-border rounded-xl p-6 max-w-[560px] shadow-sm space-y-5"
        aria-busy={isSubmitting}
      >
        <div>
          <Label htmlFor="addon_name">{t.serviceTypes.addons.name}</Label>
          <Input
            id="addon_name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-[12px] text-error mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="addon_price">{t.serviceTypes.addons.price}</Label>
          <div className="relative">
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none select-none">
              ₪
            </span>
            <Input
              id="addon_price"
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={!!errors.price}
              disabled={isSubmitting}
              className="ps-7"
            />
          </div>
          {errors.price && <p className="text-[12px] text-error mt-1">{errors.price}</p>}
        </div>

        <fieldset className="space-y-2 min-w-0">
          <legend className="text-sm font-medium text-text-primary mb-2">
            {t.serviceTypes.addons.selectTypesLabel}
          </legend>
          <p className="text-[13px] text-text-muted mb-3">{t.serviceTypes.addons.selectTypesHint}</p>
          <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto border border-border rounded-lg p-3 bg-background">
            {serviceTypes.length === 0 ? (
              <p className="text-sm text-text-muted">{t.serviceTypes.noServiceTypes}</p>
            ) : (
              serviceTypes.map((st) => (
                <label
                  key={st.id}
                  className="flex items-center gap-2 cursor-pointer text-sm py-1.5 px-1 rounded-md hover:bg-surface transition-colors"
                >
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border text-primary focus:ring-focusRing"
                    checked={selectedTypeIds.has(st.id)}
                    onChange={() => toggleType(st.id)}
                    disabled={isSubmitting}
                  />
                  <span>{st.name}</span>
                </label>
              ))
            )}
          </div>
        </fieldset>

        <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
          {t.forms.save}
        </Button>

        <Link
          href="/service-types"
          className="block text-center text-primary underline hover:text-primary-dark text-sm transition-colors"
        >
          {t.serviceTypes.addons.backToServiceTypes}
        </Link>
      </form>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
