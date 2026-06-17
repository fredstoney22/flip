/**
 * Format a date string (YYYY-MM-DD) for display with weekday and full date.
 */
export function formatLongDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format a date for short display (e.g. in dashboard).
 */
export function formatShortDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString();
}
