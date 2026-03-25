const STATUS_COLOR: Record<string, string> = {
  Delivered:     "bg-green-100 text-green-800",
  Invoiced:      "bg-blue-100 text-blue-800",
  Scheduled:     "bg-amber-100 text-amber-800",
  "In Progress": "bg-purple-100 text-purple-800",
}

interface BookingStatusBadgeProps {
  status: string
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[status] ?? "bg-muted text-zinc-700"}`}>
      {status}
    </span>
  )
}
