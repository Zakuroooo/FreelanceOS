/** Shared date/number formatting — one implementation instead of page-local copies. */

/** "Today" / "3d ago". Future dates clamp to Today instead of "-1d ago". */
export function daysSince(dateStr?: string | null): string | null {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  if (!Number.isFinite(diff)) return null
  if (diff <= 0) return 'Today'
  const days = Math.floor(diff / 86400000)
  return days === 0 ? 'Today' : `${days}d ago`
}

/** Relative time for feed rows. */
export function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return 'just now'
  const diff = Date.now() - new Date(dateStr).getTime()
  if (!Number.isFinite(diff) || diff <= 0) return 'just now'
  const mins = Math.floor(diff / 60000)
  const hrs  = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days}d ago`
  if (hrs > 0)  return `${hrs}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'just now'
}

export function formatCurrency(val: number, currency = 'INR'): string {
  if (currency === 'USD') return `$${val.toLocaleString()}`
  return `₹${val.toLocaleString('en-IN')}`
}
