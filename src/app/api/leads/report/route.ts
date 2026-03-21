import { sql } from '@/lib/db';
import { json, parseSearchParams, withApiHandlerNoParams } from '@/lib/http';
import { LeadReportQuerySchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export const GET = withApiHandlerNoParams(async (request) => {
  const { days } = parseSearchParams(LeadReportQuerySchema, request);

  const summary = await sql`
      WITH base AS (
        SELECT *
        FROM leads
        WHERE submitted_at >= NOW() - (${days} * INTERVAL '1 day')
      ),
      conv AS (
        SELECT
          l.id AS lead_id,
          l.submitted_at,
          MIN(e.created_at) FILTER (WHERE e.type = 'conversion') AS converted_at,
          MIN(e.created_at) FILTER (
            WHERE e.type = 'stage_change'
              AND (e.payload->>'to') IN ('contacted','scheduled','converted')
          ) AS first_contact_at
        FROM base l
        LEFT JOIN lead_events e ON e.lead_id = l.id
        GROUP BY l.id, l.submitted_at
      )
      SELECT
        (SELECT COUNT(*)::int FROM base) AS leads_total,
        (SELECT COUNT(*)::int FROM base WHERE stage = 'converted') AS leads_converted,
        (SELECT ROUND(100.0 * COUNT(*) / NULLIF((SELECT COUNT(*) FROM base), 0), 1)
         FROM base WHERE stage = 'converted') AS conversion_rate_pct,
        (SELECT ROUND((AVG(EXTRACT(EPOCH FROM (first_contact_at - submitted_at)) / 60.0)::numeric), 1)
         FROM conv WHERE first_contact_at IS NOT NULL) AS avg_minutes_to_first_contact,
        (SELECT ROUND((AVG(EXTRACT(EPOCH FROM (converted_at - submitted_at)) / 60.0)::numeric), 1)
         FROM conv WHERE converted_at IS NOT NULL) AS avg_minutes_to_convert
    `;

  const byStage = await sql`
    SELECT stage, COUNT(*)::int AS total
    FROM leads
    WHERE submitted_at >= NOW() - (${days} * INTERVAL '1 day')
    GROUP BY stage
    ORDER BY total DESC
  `;

  const bySource = await sql`
    SELECT source_channel, COUNT(*)::int AS total,
      ROUND(100.0 * SUM(CASE WHEN stage = 'converted' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 1) AS conversion_rate_pct
    FROM leads
    WHERE submitted_at >= NOW() - (${days} * INTERVAL '1 day')
    GROUP BY source_channel
    ORDER BY total DESC
  `;

  const byCampaign = await sql`
    WITH base AS (
      SELECT *
      FROM leads
      WHERE submitted_at >= NOW() - (${days} * INTERVAL '1 day')
    ),
    conv_customers AS (
      SELECT DISTINCT campaign_id, converted_customer_id
      FROM base
      WHERE converted_customer_id IS NOT NULL
    ),
    revenue AS (
      SELECT
        cc.campaign_id,
        COALESCE(SUM(ie.amount), 0)::numeric(12,2) AS revenue_ils
      FROM conv_customers cc
      LEFT JOIN income_entries ie ON ie.customer_id = cc.converted_customer_id
      GROUP BY cc.campaign_id
    )
    SELECT
      c.id AS campaign_id,
      c.name AS campaign_name,
      COUNT(b.*)::int AS total,
      ROUND(100.0 * SUM(CASE WHEN b.stage = 'converted' THEN 1 ELSE 0 END) / NULLIF(COUNT(b.*), 0), 1) AS conversion_rate_pct,
      COALESCE(r.revenue_ils, 0)::numeric(12,2) AS revenue_ils
    FROM base b
    LEFT JOIN campaigns c ON c.id = b.campaign_id
    LEFT JOIN revenue r ON r.campaign_id = b.campaign_id
    GROUP BY c.id, c.name, r.revenue_ils
    ORDER BY total DESC
    LIMIT 20
  `;

  const perDay = await sql`
    SELECT
      to_char(date_trunc('day', submitted_at), 'YYYY-MM-DD') AS day,
      COUNT(*)::int AS total
    FROM leads
    WHERE submitted_at >= NOW() - (${days} * INTERVAL '1 day')
    GROUP BY 1
    ORDER BY day ASC
  `;

  return json({
    days,
    summary: summary.rows[0],
    byStage: byStage.rows,
    bySource: bySource.rows,
    byCampaign: byCampaign.rows,
    perDay: perDay.rows,
  });
});
