import { deleteBlobByUrl } from '@/lib/blob';
import { sql } from '@/lib/db';
import { asSqlString } from '@/lib/sql-primitive';
import { ApiError, json, parseIdParam, parseJsonBody, parseSchema, withApiHandler } from '@/lib/http';
import { ExpenseEntrySchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const result = await sql`
    SELECT id, description, category, date, amount, invoice_url, created_at
    FROM expense_entries
    WHERE id = ${id}
  `;

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  return json(result.rows[0]);
});

export const PUT = withApiHandler(async (request, { params }) => {
  const id = parseIdParam(params.id);

  const existing = await sql`
    SELECT id, invoice_url AS previous_invoice_url
    FROM expense_entries
    WHERE id = ${id}
  `;

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  const previousUrl = (existing.rows[0] as { previous_invoice_url: string | null })
    .previous_invoice_url;

  const body = await parseJsonBody(request);
  const data = parseSchema(ExpenseEntrySchema, body);

  const { description, category, date, amount, invoice_url } = data;

  const nextInvoiceUrl: string | null =
    invoice_url === undefined ? previousUrl : asSqlString(invoice_url);

  const result = await sql`
    UPDATE expense_entries
    SET
      description = ${description},
      category = ${category},
      date = ${date},
      amount = ${amount},
      invoice_url = ${nextInvoiceUrl}
    WHERE id = ${id}
    RETURNING id, description, category, date, amount, invoice_url, created_at
  `;

  if (previousUrl && previousUrl !== nextInvoiceUrl) {
    try {
      await deleteBlobByUrl(previousUrl);
    } catch (e) {
      console.error('Failed to delete previous expense invoice blob', e);
    }
  }

  return json(result.rows[0]);
});

export const DELETE = withApiHandler(async (_request, { params }) => {
  const id = parseIdParam(params.id);

  const existing = await sql`
    SELECT id, invoice_url
    FROM expense_entries
    WHERE id = ${id}
  `;

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Not found');
  }

  const row = existing.rows[0] as { invoice_url: string | null };
  if (row.invoice_url) {
    try {
      await deleteBlobByUrl(row.invoice_url);
    } catch (e) {
      console.error('Failed to delete expense invoice blob', e);
    }
  }

  await sql`DELETE FROM expense_entries WHERE id = ${id}`;

  return new Response(null, { status: 204 });
});
