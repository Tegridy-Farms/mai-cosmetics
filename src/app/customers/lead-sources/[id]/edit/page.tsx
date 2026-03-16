import { notFound } from 'next/navigation';
import { LeadSourceForm } from '@/components/forms/LeadSourceForm';
import { t } from '@/lib/translations';
import type { LeadSource } from '@/types';

async function getLeadSource(id: number): Promise<LeadSource | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/lead-sources/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function EditLeadSourcePage({
  params,
}: {
  params: { id: string };
}) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) notFound();

  const leadSource = await getLeadSource(id);
  if (!leadSource) notFound();

  return (
    <>
      <h1 className="text-2xl sm:text-[30px] font-bold text-text-primary mb-6">
        {t.leadSources.editLeadSource}
      </h1>
      <LeadSourceForm
        initialName={leadSource.name}
        initialSortOrder={leadSource.sort_order}
        leadSourceId={leadSource.id}
      />
    </>
  );
}
