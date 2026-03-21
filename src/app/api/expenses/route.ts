import { sql } from '@/lib/db';
import { json, parseJsonBody, parseSchema, parseSearchParams, withApiHandlerNoParams } from '@/lib/http';
import { ExpenseEntrySchema, ExpenseQuerySchema } from '@/lib/schemas';
import type { ExpenseEntry } from '@/types';

export const POST = withApiHandlerNoParams(async (request) => {
  const body = await parseJsonBody(request);
  const parsed = parseSchema(ExpenseEntrySchema, body);

  const { description, category, date, amount } = parsed;

  const result = await sql`
    INSERT INTO expense_entries (description, category, date, amount)
    VALUES (${description}, ${category}, ${date}, ${amount})
    RETURNING id, description, category, date, amount, created_at
  `;

  return json(result.rows[0], 201);
});

export const GET = withApiHandlerNoParams(async (request) => {
  const q = parseSearchParams(ExpenseQuerySchema, request, 'Invalid query parameters');
  const page = q.page ?? 1;
  const { category, date_from, date_to } = q;
  const offset = (page - 1) * 20;

  const [countResult, dataResult] = await Promise.all([
    sql`
      SELECT COUNT(*) AS total
      FROM expense_entries
      WHERE (${category}::text IS NULL OR category = ${category ?? null})
        AND (${date_from}::date IS NULL OR date >= ${date_from ?? null})
        AND (${date_to}::date IS NULL OR date <= ${date_to ?? null})
    `,
    sql`
      SELECT id, description, category, date, amount, created_at
      FROM expense_entries
      WHERE (${category}::text IS NULL OR category = ${category ?? null})
        AND (${date_from}::date IS NULL OR date >= ${date_from ?? null})
        AND (${date_to}::date IS NULL OR date <= ${date_to ?? null})
      ORDER BY date DESC, id DESC
      LIMIT 20 OFFSET ${offset}
    `,
  ]);

  const total = parseInt((countResult.rows[0] as { total: string }).total, 10);
  const data = dataResult.rows as ExpenseEntry[];

  return json({ data, total, page, pageSize: 20 });
});
