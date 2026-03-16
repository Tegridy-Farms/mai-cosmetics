import { ExpenseForm } from '@/components/forms/ExpenseForm';
import { t } from '@/lib/translations';

export default function ExpensesNewPage() {
  return (
    <main className="pt-12 max-w-[560px] mx-auto px-4">
      <p className="text-[12px] text-text-muted mb-4">{t.pages.breadcrumbLogExpense}</p>
      <h1 className="text-[30px] font-bold mb-6">{t.pages.logExpense}</h1>
      <ExpenseForm />
    </main>
  );
}
