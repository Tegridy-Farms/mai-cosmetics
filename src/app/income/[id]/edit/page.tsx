import { notFound } from 'next/navigation';
import { IncomeForm } from '@/components/forms/IncomeForm';
import { t } from '@/lib/translations';
import type { IncomeEntry, ServiceType } from '@/types';

async function getIncomeEntry(id: number): Promise<IncomeEntry | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/income/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getServiceTypes(): Promise<ServiceType[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/service-types`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function IncomeEditPage({
  params,
}: {
  params: { id: string };
}) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) notFound();

  const [entry, serviceTypes] = await Promise.all([
    getIncomeEntry(id),
    getServiceTypes(),
  ]);

  if (!entry) notFound();

  return (
    <main className="max-w-[560px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <p className="text-[12px] text-text-muted mb-4">{t.pages.breadcrumbEditIncome}</p>
      <h1 className="text-2xl sm:text-[30px] font-bold mb-6">{t.pages.editIncome}</h1>
      <IncomeForm
        serviceTypes={serviceTypes}
        incomeId={id}
        initialData={{
          service_name: entry.service_name,
          service_type_id: entry.service_type_id,
          customer_id: entry.customer_id ?? undefined,
          date: entry.date,
          duration_minutes: entry.duration_minutes,
          amount: entry.amount,
        }}
      />
    </main>
  );
}
