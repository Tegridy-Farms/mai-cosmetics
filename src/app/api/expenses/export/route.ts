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
    SELECT date, description, category, amount, invoice_url
    FROM expense_entries
    ORDER BY date DESC, id DESC
  `;

  const rows = result.rows as Array<{
    date: string;
    description: string;
    category: string;
    amount: number;
    invoice_url: string | null;
  }>;

  const today = new Date().toISOString().split('T')[0];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('Date,Description,Category,Amount,InvoiceUrl\n'));
      for (const row of rows) {
        const invoice = row.invoice_url ?? '';
        const line = `${row.date},${escapeCsv(row.description)},${escapeCsv(row.category)},${row.amount},${escapeCsv(invoice)}\n`;
        controller.enqueue(encoder.encode(line));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="mai-cosmetics-expenses-${today}.csv"`,
    },
  });
});
