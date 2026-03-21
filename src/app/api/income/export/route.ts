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

export const GET = withApiHandlerNoParams(async () => {
  const result = await sql`
    SELECT
      i.date::text AS date,
      i.service_name,
      st.name AS service_type_name,
      i.duration_minutes,
      i.amount,
      COALESCE(i.comment, '') AS comment
    FROM income_entries i
    JOIN service_types st ON i.service_type_id = st.id
    ORDER BY i.date DESC, i.id DESC
  `;

  const rows = result.rows as Array<{
    date: string;
    service_name: string;
    service_type_name: string;
    duration_minutes: number;
    amount: number;
    comment: string;
  }>;

  const today = new Date().toISOString().split('T')[0];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('Date,Service Name,Service Type,Duration (min),Amount,Comment\n'));
      for (const row of rows) {
        const line = `${row.date},${escapeCsv(row.service_name)},${escapeCsv(row.service_type_name)},${row.duration_minutes},${row.amount},${escapeCsv(row.comment)}\n`;
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
