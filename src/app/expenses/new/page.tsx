import { ExpenseForm } from '@/components/forms/ExpenseForm';

export default function ExpensesNewPage() {
  return (
    <main className="pt-12 max-w-[560px] mx-auto px-4">
      <p className="text-[12px] text-[#6B7280] mb-4">Dashboard → Log Expense</p>
      <h1 className="text-[30px] font-bold mb-6">Log Expense</h1>
      <ExpenseForm />
    </main>
  );
}
