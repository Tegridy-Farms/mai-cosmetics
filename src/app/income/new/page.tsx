import { IncomeForm } from '@/components/forms/IncomeForm';
import { t } from '@/lib/translations';

interface ServiceType {
  id: number;
  name: string;
}

async function getServiceTypes(): Promise<ServiceType[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/service-types`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.service_types ?? []);
  } catch {
    return [];
  }
}

export default async function IncomeNewPage() {
  const serviceTypes = await getServiceTypes();

  return (
    <main className="pt-12 max-w-[560px] mx-auto px-4">
      <p className="text-[12px] text-[#6B7280] mb-4">{t.pages.breadcrumbLogIncome}</p>
      <h1 className="text-[30px] font-bold mb-6">{t.pages.logIncome}</h1>
      <IncomeForm serviceTypes={serviceTypes} />
    </main>
  );
}
