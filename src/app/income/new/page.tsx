import { IncomeForm } from '@/components/forms/IncomeForm';
import { t } from '@/lib/translations';

interface ServiceType {
  id: number;
  name: string;
  default_price?: number | null;
}

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
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

async function getCustomers(): Promise<Customer[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/customers?page=1`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export default async function IncomeNewPage() {
  const [serviceTypes, customers] = await Promise.all([
    getServiceTypes(),
    getCustomers(),
  ]);

  return (
    <main className="pt-6 sm:pt-12 pb-8 max-w-[560px] mx-auto px-4 sm:px-6">
      <p className="text-[12px] text-text-muted mb-4">{t.pages.breadcrumbLogIncome}</p>
      <h1 className="text-2xl sm:text-[30px] font-bold mb-6">{t.pages.logIncome}</h1>
      <IncomeForm serviceTypes={serviceTypes} customers={customers} />
    </main>
  );
}
