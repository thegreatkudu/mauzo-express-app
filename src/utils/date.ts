// Date formatting utilities

/** "Jun 12, 2026" */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** "2 days ago" / "just now" */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

/** Days between now and a future ISO string */
export function daysRemaining(iso: string | null): number {
  if (!iso) return 0
  const diff = new Date(iso).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86_400_000))
}

/** Format #ORD-XXXX from raw UUID (first 8 chars uppercased) */
export function formatOrderId(uuid: string): string {
  return '#ORD-' + uuid.replace(/-/g, '').slice(0, 8).toUpperCase()
}
