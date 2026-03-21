import type { LeadEventType, LeadStage } from '@/types';

const LEAD_STAGES: readonly LeadStage[] = [
  'new',
  'qualified',
  'contacted',
  'scheduled',
  'converted',
  'lost',
] as const;

export type LeadStageLabels = Record<LeadStage, string> & { fromNull: string };

export function isLeadStage(value: string): value is LeadStage {
  return (LEAD_STAGES as readonly string[]).includes(value);
}

export function stageDisplayName(stage: string | null | undefined, labels: LeadStageLabels): string {
  if (stage === null || stage === undefined || stage === '') return labels.fromNull;
  if (isLeadStage(stage)) return labels[stage];
  return stage;
}

export function isStageChangePayload(
  payload: Record<string, unknown>
): payload is { from: string | null; to: string } {
  const to = payload.to;
  if (typeof to !== 'string' || !isLeadStage(to)) return false;
  const from = payload.from;
  if (from !== null && from !== undefined && typeof from !== 'string') return false;
  if (typeof from === 'string' && from !== '' && !isLeadStage(from)) return false;
  return true;
}

export function isNotePayload(payload: Record<string, unknown>): payload is { text: string } {
  return typeof payload.text === 'string';
}

export function isConversionPayload(payload: Record<string, unknown>): boolean {
  if (!('customer_id' in payload) && !('deduped' in payload)) return false;
  const d = payload.deduped;
  if (d !== undefined && typeof d !== 'boolean' && typeof d !== 'string') return false;
  const c = payload.customer_id;
  if (
    c !== undefined &&
    typeof c !== 'number' &&
    typeof c !== 'string'
  ) {
    return false;
  }
  return true;
}

export function conversionCustomerId(payload: Record<string, unknown>): number | undefined {
  const c = payload.customer_id;
  if (typeof c === 'number' && Number.isFinite(c)) return c;
  if (typeof c === 'string') {
    const n = parseInt(c, 10);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

export function conversionIsDeduped(payload: Record<string, unknown>): boolean {
  const d = payload.deduped;
  return d === true || d === 'true';
}

const ATTRIBUTION_KEY_ORDER = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'referrer',
  'landing_path',
  'ip',
  'user_agent',
] as const;

export type AttributionLabelKey = (typeof ATTRIBUTION_KEY_ORDER)[number];

export type AttributionRow = {
  label: string;
  display: string;
  full?: string;
};

function asTrimmedString(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value).trim();
  return s;
}

const DEFAULT_MAX_LEN = 140;

export function truncateForDisplay(
  value: string,
  maxLen = DEFAULT_MAX_LEN
): { display: string; full?: string } {
  if (value.length <= maxLen) return { display: value };
  return { display: `${value.slice(0, maxLen - 1)}…`, full: value };
}

export type AttributionLabelsMap = Record<AttributionLabelKey, string>;

export function buildAttributionRows(
  attribution: Record<string, unknown> | null | undefined,
  labelByKey: AttributionLabelsMap,
  maxLen = DEFAULT_MAX_LEN
): { rows: AttributionRow[]; unknownJson: string | null } {
  if (!attribution || typeof attribution !== 'object') return { rows: [], unknownJson: null };

  const rows: AttributionRow[] = [];
  const seen = new Set<string>();

  for (const key of ATTRIBUTION_KEY_ORDER) {
    seen.add(key);
    const raw = asTrimmedString(attribution[key]);
    if (!raw) continue;
    const { display, full } = truncateForDisplay(raw, maxLen);
    rows.push({ label: labelByKey[key], display, full });
  }

  const extra: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(attribution)) {
    if (seen.has(k)) continue;
    const s = asTrimmedString(v);
    if (!s) continue;
    extra[k] = v;
  }

  const unknownJson =
    Object.keys(extra).length > 0 ? JSON.stringify(extra, null, 2) : null;

  return { rows, unknownJson };
}

export type LeadEventVisual = {
  rail: string;
  card: string;
  dot: string;
};

export function leadEventVisual(type: LeadEventType): LeadEventVisual {
  switch (type) {
    case 'conversion':
      return {
        rail: 'bg-emerald-200',
        card: 'bg-emerald-50/90 border-emerald-200/80',
        dot: 'bg-emerald-500',
      };
    case 'stage_change':
      return {
        rail: 'bg-sky-200',
        card: 'bg-sky-50/90 border-sky-200/80',
        dot: 'bg-sky-500',
      };
    case 'note':
      return {
        rail: 'bg-amber-200',
        card: 'bg-amber-50/90 border-amber-200/80',
        dot: 'bg-amber-500',
      };
    case 'contact_attempt':
      return {
        rail: 'bg-violet-200',
        card: 'bg-violet-50/90 border-violet-200/80',
        dot: 'bg-violet-500',
      };
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function safeStringifyPayload(payload: Record<string, unknown>): string {
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}
