import { sql } from '@/lib/db';
import { withApiHandlerNoParams } from '@/lib/http';

export const dynamic = 'force-dynamic';

function escapeCsv(value: string): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatAppliedAddonsForCsv(
  ids: unknown,
  nameById: Map<number, string>
): string {
  if (!Array.isArray(ids) || ids.length === 0) return '';
  const counts = new Map<number, number>();
  for (const id of ids) {
    if (typeof id !== 'number' || !Number.isInteger(id)) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const parts: string[] = [];
  for (const [id, n] of counts) {
    const label = nameById.get(id) ?? `#${id}`;
    parts.push(n > 1 ? `${label} x${n}` : label);
  }
  return parts.join('; ');
}

export const GET = withApiHandlerNoParams(async () => {
  const [result, addonsResult] = await Promise.all([
    sql`
      SELECT
        i.date::text AS date,
        i.service_name,
        st.name AS service_type_name,
        i.duration_minutes,
        i.amount,
        i.applied_addon_ids,
        COALESCE(i.comment, '') AS comment
      FROM income_entries i
      JOIN service_types st ON i.service_type_id = st.id
      ORDER BY i.date DESC, i.id DESC
    `,
    sql`SELECT id, name FROM addons`,
  ]);

  const nameById = new Map<number, string>(
    (addonsResult.rows as { id: number; name: string }[]).map((r) => [r.id, r.name])
  );

  const rows = result.rows as Array<{
    date: string;
    service_name: string;
    service_type_name: string;
    duration_minutes: number;
    amount: number;
    applied_addon_ids: unknown;
    comment: string;
  }>;

  const today = new Date().toISOString().split('T')[0];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode('Date,Service Name,Service Type,Duration (min),Amount,Addons,Comment\n')
      );
      for (const row of rows) {
        const addonsCol = formatAppliedAddonsForCsv(row.applied_addon_ids, nameById);
        const line = `${row.date},${escapeCsv(row.service_name)},${escapeCsv(row.service_type_name)},${row.duration_minutes},${row.amount},${escapeCsv(addonsCol)},${escapeCsv(row.comment)}\n`;
        controller.enqueue(encoder.encode(line));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="mai-cosmetics-income-${today}.csv"`,
    },
  });
});
