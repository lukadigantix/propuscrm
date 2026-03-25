import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import type { SubscriptionStatus } from "@/lib/data/contacts"

export function daysLeft(ends_at: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.round((new Date(ends_at).getTime() - today.getTime()) / 86_400_000)
}

export type SubBucket = "active" | "expiring" | "expired"

export function getSubBucket(ends_at: string, status: SubscriptionStatus): SubBucket {
  if (status === "expired" || status === "cancelled") return "expired"
  return daysLeft(ends_at) <= 30 ? "expiring" : "active"
}

interface SubscriptionBadgeProps {
  ends_at: string
  status: SubscriptionStatus
  /** "sm" (default) for list rows, "md" for detail cards */
  size?: "sm" | "md"
}

export function SubscriptionBadge({ ends_at, status, size = "sm" }: SubscriptionBadgeProps) {
  const bucket = getSubBucket(ends_at, status)
  const days   = daysLeft(ends_at)
  const px     = size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-1 text-xs"
  const icon   = size === "md" ? "size-3.5" : "size-3"

  if (bucket === "expired")
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-100 font-semibold text-red-700 ${px}`}>
        <XCircle className={icon} />Expired
      </span>
    )
  if (bucket === "expiring")
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-100 font-semibold text-amber-700 ${px}`}>
        <AlertTriangle className={icon} />
        {size === "md"
          ? days <= 0 ? "Expires today" : `Expires in ${days} days`
          : `${days}d left`}
      </span>
    )
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-green-100 font-semibold text-green-700 ${px}`}>
      <CheckCircle2 className={icon} />
      {size === "md" ? `Active — ${days} days left` : `${days}d left`}
    </span>
  )
}
