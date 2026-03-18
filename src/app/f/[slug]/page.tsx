import { sql } from '@/lib/db';
import { PublicLeadForm } from './PublicLeadForm';

export const dynamic = 'force-dynamic';

export default async function PublicFormPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  const formResult = await sql`
    SELECT id, name, slug, status, ui_schema
    FROM forms
    WHERE slug = ${slug}
    LIMIT 1
  `;

  const form = formResult.rows[0] as
    | { id: number; name: string; slug: string; status: 'draft' | 'published' | 'archived'; ui_schema: Record<string, unknown> }
    | undefined;

  if (!form || form.status !== 'published') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-border rounded-2xl p-6 text-center">
          <div className="text-2xl font-bold">הטופס לא נמצא</div>
          <div className="text-text-secondary mt-2">ייתכן שפג תוקף הקישור או שהטופס הוסר.</div>
        </div>
      </div>
    );
  }

  return <PublicLeadForm form={form} />;
}

