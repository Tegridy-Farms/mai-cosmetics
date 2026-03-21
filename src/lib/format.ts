const LOCALE = 'he-IL';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Format a calendar date for Hebrew locale display.
 * Accepts Postgres/API `YYYY-MM-DD` and ISO datetimes from drivers (e.g. `…T00:00:00.000Z`).
 * Date-only values use noon local time to avoid timezone shifting the calendar day.
 */
export function formatDate(dateStr: string): string {
  const s = dateStr.trim();
  if (!s) return '—';

  let d: Date;
  if (DATE_ONLY.test(s)) {
    d = new Date(`${s}T12:00:00`);
  } else {
    d = new Date(s);
  }

  if (Number.isNaN(d.getTime())) return '—';

  return d.toLocaleDateString(LOCALE, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a month string (YYYY-MM) for chart axes.
 */
export function formatMonth(month: string): string {
  const [year, mon] = month.split('-');
  const date = new Date(Number(year), Number(mon) - 1, 1);
  return date.toLocaleDateString(LOCALE, { month: 'short' });
}

/**
 * Format a month string for chart title range (e.g. "Jan – Dec 2024").
 */
export function formatMonthLabel(month: string): string {
  const [year, mon] = month.split('-');
  const date = new Date(Number(year), Number(mon) - 1, 1);
  return date.toLocaleDateString(LOCALE, { month: 'short', year: 'numeric' });
}

/**
 * Format currency amount in ILS.
 * In RTL/Hebrew, symbol typically appears to the right: "123.45 ₪"
 */
export function formatAmount(value: number): string {
  return `${value.toLocaleString(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₪`;
}

/**
 * Format amount for Y-axis (compact: 1k, 2.5k, etc.)
 */
export function formatAmountShort(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toLocaleString(LOCALE, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}k ₪`;
  }
  return formatAmount(value);
}

/**
 * Format amount for tooltip (full precision).
 */
export function formatAmountTooltip(value: number): string {
  return formatAmount(value);
}
