import { notFound } from 'next/navigation';
import { ServiceTypeForm } from '@/components/forms/ServiceTypeForm';
import { t } from '@/lib/translations';
import type { ServiceType } from '@/types';

async function getServiceType(id: number): Promise<ServiceType | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/service-types/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function EditServiceTypePage({
  params,
}: {
  params: { id: string };
}) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) notFound();

  const serviceType = await getServiceType(id);
  if (!serviceType) notFound();

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary mb-6">
        {t.serviceTypes.editServiceType}
      </h1>
      <ServiceTypeForm
        initialName={serviceType.name}
        initialDefaultPrice={serviceType.default_price}
        serviceTypeId={serviceType.id}
      />
    </div>
  );
}
