import { IncomeForm } from '@/components/forms/IncomeForm';
import { serverFetch } from '@/lib/server-fetch';
import { t } from '@/lib/translations';

interface ServiceType {
  id: number;
  name: string;
  default_price?: number | null;
}

async function getServiceTypes(): Promise<ServiceType[]> {
  try {
    const res = await serverFetch('/api/service-types');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.service_types ?? []);
  } catch {
    return [];
  }
}

function parseCustomerIdFromSearch(
  searchParams?: Record<string, string | string[] | undefined>
): number | undefined {
  const raw = searchParams?.customer_id;
  const s = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined;
  if (!s || !/^\d+$/.test(s)) return undefined;
  const n = parseInt(s, 10);
  return n > 0 ? n : undefined;
}

export default async function IncomeNewPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const serviceTypes = await getServiceTypes();
  const presetCustomerId = parseCustomerIdFromSearch(searchParams);

  return (
    <main className="pt-6 sm:pt-12 pb-8 max-w-[560px] mx-auto px-4 sm:px-6">
      <p className="text-[12px] text-text-muted mb-4">{t.pages.breadcrumbLogIncome}</p>
      <h1 className="text-2xl sm:text-[30px] font-bold mb-6">{t.pages.logIncome}</h1>
      <IncomeForm
        serviceTypes={serviceTypes}
        initialData={presetCustomerId != null ? { customer_id: presetCustomerId } : undefined}
      />
    </main>
  );
}
