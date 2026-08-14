export type DateStyle = 'short' | 'medium' | 'full'

/**
 * Formats an ISO date string for display. `style` controls detail level:
 * - short:  "Aug 12"                          (compact contexts, e.g. sidebar rows)
 * - medium: "Aug 12, 2026"                     (list cards)
 * - full:   "Wednesday, August 12, 2026"       (single-entry detail view)
 */
export function formatEntryDate(iso: string, style: DateStyle = 'medium'): string {
  const date = new Date(iso)
  if (style === 'short') {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }
  if (style === 'full') {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
