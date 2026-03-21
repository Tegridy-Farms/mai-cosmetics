import { notFound } from 'next/navigation';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import { serverFetch } from '@/lib/server-fetch';
import { t } from '@/lib/translations';
import type { ExpenseEntry } from '@/types';

async function getExpenseEntry(id: number): Promise<ExpenseEntry | null> {
  try {
    const res = await serverFetch(`/api/expenses/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function ExpenseEditPage({
  params,
}: {
  params: { id: string };
}) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) notFound();

  const entry = await getExpenseEntry(id);
  if (!entry) notFound();

  return (
    <main className="max-w-[560px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <p className="text-[12px] text-text-muted mb-4">{t.pages.breadcrumbEditExpense}</p>
      <h1 className="text-2xl sm:text-[30px] font-bold mb-6">{t.pages.editExpense}</h1>
      <ExpenseForm
        expenseId={id}
        initialData={{
          description: entry.description,
          category: entry.category,
          date: entry.date,
          amount: entry.amount,
          invoice_url: entry.invoice_url,
        }}
      />
    </main>
  );
}
