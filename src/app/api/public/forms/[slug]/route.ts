import { sql } from '@/lib/db';
import { ApiError, json, withApiHandler } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (_request, { params }) => {
  const slug = typeof params.slug === 'string' ? params.slug : params.slug?.[0];
  if (!slug) throw new ApiError(400, 'Invalid slug');

  const result = await sql`
    SELECT id, campaign_id, name, slug, status, ui_schema, created_at, updated_at
    FROM forms
    WHERE slug = ${slug}
    LIMIT 1
  `;

  const form = result.rows[0];
  if (!form) throw new ApiError(404, 'Not found');
  if (form.status !== 'published') throw new ApiError(404, 'Not found');

  return json(form);
});
