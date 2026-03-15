'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast, ToastContainer } from '@/components/ui/toast';

const CATEGORY_OPTIONS = [
  { value: 'equipment', label: 'Equipment' },
  { value: 'materials', label: 'Materials' },
  { value: 'consumables', label: 'Consumables' },
  { value: 'other', label: 'Other' },
];

const FormSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['equipment', 'materials', 'consumables', 'other'], {
    errorMap: () => ({ message: 'Category is required' }),
  }),
  date: z.string().min(1, 'Date is required'),
  amount: z.number().positive('Amount must be greater than 0'),
});

type FormErrors = Partial<Record<keyof z.infer<typeof FormSchema>, string>>;

export function ExpenseForm() {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
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
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        showToast('Could not save. Please try again.', 'error');
        return;
      }

      showToast('Expense logged', 'success');
      setDescription('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
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
          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
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
              <p id="description-error" className="text-[12px] text-[#C81E1E] mt-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              id="category"
              options={CATEGORY_OPTIONS}
              placeholder="Select category"
              value={category}
              onValueChange={setCategory}
              error={!!errors.category}
              aria-invalid={errors.category ? 'true' : undefined}
              aria-describedby={errors.category ? 'category-error' : undefined}
              disabled={isSubmitting}
            />
            {errors.category && (
              <p id="category-error" className="text-[12px] text-[#C81E1E] mt-1">
                {errors.category}
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
