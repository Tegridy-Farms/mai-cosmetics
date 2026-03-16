const LOCALE = 'he-IL';

/**
 * Format a date string (YYYY-MM-DD) for Hebrew locale display.
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
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
