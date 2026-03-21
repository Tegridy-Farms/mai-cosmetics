'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { t } from '@/lib/translations';
import type { ExpenseEntry } from '@/types';

const CATEGORY_OPTIONS = [
  { value: 'equipment', label: t.categories.equipment },
  { value: 'materials', label: t.categories.materials },
  { value: 'consumables', label: t.categories.consumables },
  { value: 'other', label: t.categories.other },
];

const INVOICE_ACCEPT = '.pdf,image/jpeg,image/png,image/webp,application/pdf';

function createFormSchema() {
  return z.object({
    description: z.string().min(1, t.forms.descriptionRequired),
    category: z.enum(['equipment', 'materials', 'consumables', 'other'], {
      errorMap: () => ({ message: t.forms.categoryRequired }),
    }),
    date: z.string().min(1, t.forms.dateRequired),
    amount: z.number().positive(t.forms.amountRequired),
  });
}

const FormSchema = createFormSchema();

type FormErrors = Partial<Record<keyof z.infer<typeof FormSchema>, string>>;

interface ExpenseFormProps {
  expenseId?: number;
  initialData?: {
    description: string;
    category: ExpenseEntry['category'];
    date: string;
    amount: number;
    invoice_url?: string | null;
  };
}

export function ExpenseForm({ expenseId, initialData }: ExpenseFormProps) {
  const isEdit = !!expenseId;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [date, setDate] = useState(
    initialData?.date ?? new Date().toISOString().split('T')[0]
  );
  const [amount, setAmount] = useState(
    initialData?.amount != null ? String(initialData.amount) : ''
  );
  const [existingInvoiceUrl] = useState<string | null>(
    () => initialData?.invoice_url ?? null
  );
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [removeInvoiceRequested, setRemoveInvoiceRequested] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, toasts } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rawData = {
      description,
      category,
      date,
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
      let invoice_url: string | null;
      if (fileToUpload) {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        const uploadRes = await fetch('/api/blob/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) {
          showToast(t.toast.invoiceUploadFailed, 'error');
          setIsSubmitting(false);
          return;
        }
        const uploadJson = (await uploadRes.json()) as { url?: string };
        if (!uploadJson.url) {
          showToast(t.toast.invoiceUploadFailed, 'error');
          setIsSubmitting(false);
          return;
        }
        invoice_url = uploadJson.url;
      } else if (removeInvoiceRequested) {
        invoice_url = null;
      } else {
        invoice_url = existingInvoiceUrl ?? null;
      }

      const url = isEdit ? `/api/expenses/${expenseId}` : '/api/expenses';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result.data,
          invoice_url,
        }),
      });

      if (!response.ok) {
        showToast(t.toast.couldNotSave, 'error');
        return;
      }

      showToast(t.toast.expenseLogged, 'success');

      if (isEdit) {
        window.location.href = '/expenses';
      } else {
        setDescription('');
        setCategory('');
        setDate(new Date().toISOString().split('T')[0]);
        setAmount('');
        setFileToUpload(null);
        setRemoveInvoiceRequested(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch {
      showToast(t.toast.couldNotSave, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showExistingLink = existingInvoiceUrl && !fileToUpload && !removeInvoiceRequested;

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        aria-busy={isSubmitting}
        className="bg-surface border border-border rounded-xl p-6 max-w-[560px] mx-auto shadow-sm"
      >
        <div className="flex flex-col gap-4">
          {/* Description */}
          <div>
            <Label htmlFor="description">{t.forms.description}</Label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={!!errors.description}
              aria-invalid={errors.description ? 'true' : undefined}
              aria-describedby={errors.description ? 'description-error' : undefined}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p id="description-error" className="text-[12px] text-error mt-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">{t.forms.category}</Label>
            <Select
              id="category"
              options={CATEGORY_OPTIONS}
              placeholder={t.forms.selectCategory}
              value={category}
              onValueChange={setCategory}
              error={!!errors.category}
              aria-invalid={errors.category ? 'true' : undefined}
              aria-describedby={errors.category ? 'category-error' : undefined}
              disabled={isSubmitting}
            />
            {errors.category && (
              <p id="category-error" className="text-[12px] text-error mt-1">
                {errors.category}
              </p>
            )}
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

          {/* Invoice */}
          <div className="border border-border rounded-lg p-4 bg-background/50">
            <Label htmlFor="invoice">{t.forms.expenseInvoice}</Label>
            <p className="text-[12px] text-text-muted mt-1 mb-2">{t.forms.expenseInvoiceHint}</p>
            <input
              ref={fileInputRef}
              id="invoice"
              type="file"
              accept={INVOICE_ACCEPT}
              disabled={isSubmitting}
              className="block w-full text-sm text-text-primary file:me-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:text-sm file:font-medium"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFileToUpload(f);
                if (f) setRemoveInvoiceRequested(false);
              }}
            />
            {fileToUpload && (
              <p className="text-[12px] text-text-muted mt-2">{fileToUpload.name}</p>
            )}
            {showExistingLink && (
              <a
                href={existingInvoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-sm text-primary underline hover:text-primary-dark"
              >
                {t.forms.viewInvoice}
              </a>
            )}
            {removeInvoiceRequested && (
              <p className="text-[12px] text-text-muted mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{t.forms.invoiceWillBeRemoved}</span>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setRemoveInvoiceRequested(false)}
                  className="text-primary hover:underline disabled:opacity-50"
                >
                  {t.forms.cancelInvoiceRemoval}
                </button>
              </p>
            )}
            {fileToUpload && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setFileToUpload(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="mt-2 text-sm text-error hover:underline disabled:opacity-50"
              >
                {t.forms.clearInvoiceFile}
              </button>
            )}
            {showExistingLink && !removeInvoiceRequested && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setRemoveInvoiceRequested(true)}
                className="mt-2 text-sm text-error hover:underline disabled:opacity-50"
              >
                {t.forms.removeInvoice}
              </button>
            )}
          </div>

          <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
            {t.forms.save}
          </Button>

          <Link
            href="/expenses"
            className="block text-center text-primary underline hover:text-primary-dark text-sm transition-colors"
          >
            {t.pages.backToExpenses}
          </Link>
        </div>
      </form>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
