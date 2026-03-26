"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Box, CreditCard, CalendarDays, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DbSubscription {
  id: string
  service: string
  status: string
  starts_at: string
  ends_at: string
  is_free: boolean
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-CH", { day: "numeric", month: "long", year: "numeric" })
}

function daysLeft(endsAt: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const end = new Date(endsAt)
  end.setHours(0, 0, 0, 0)
  return Math.max(0, Math.round((end.getTime() - now.getTime()) / 86_400_000))
}

const SERVICE_LABEL: Record<string, string> = {
  matterport: "Matterport 3D",
  photos:     "Photography",
  both:       "Full Package",
}

const SERVICE_ICON: Record<string, React.ReactNode> = {
  matterport: <Box className="size-5" />,
  photos:     <CreditCard className="size-5" />,
  both:       <CreditCard className="size-5" />,
}

function StatusBadge({ sub }: { sub: DbSubscription }) {
  const days = daysLeft(sub.ends_at)
  const isExpired = sub.status !== "active" || days === 0

  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        <AlertCircle className="size-3.5" /> Expired
      </span>
    )
  }
  if (days <= 30) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
        <Clock className="size-3.5" /> Expires in {days} days
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
      <CheckCircle2 className="size-3.5" /> Active
    </span>
  )
}

function ProgressBar({ sub }: { sub: DbSubscription }) {
  const total = Math.max(1, Math.round(
    (new Date(sub.ends_at).getTime() - new Date(sub.starts_at).getTime()) / 86_400_000
  ))
  const remaining = daysLeft(sub.ends_at)
  const pct = Math.round((remaining / total) * 100)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-foreground">{remaining} days remaining</span>
        <span className="text-xs text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct > 30 ? "bg-emerald-500" : pct > 10 ? "bg-amber-400" : "bg-red-500"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function SubscriptionClientView({ subscriptions }: { subscriptions: DbSubscription[] }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card px-6 py-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <CreditCard className="size-4 text-muted-foreground" />
        <h1 className="text-sm font-medium">My Subscription</h1>
      </header>

      <div className="p-6 max-w-2xl mx-auto flex flex-col gap-4">
        {subscriptions.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed bg-muted/20 flex flex-col items-center justify-center py-20 text-center">
            <CreditCard className="size-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No active subscriptions</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Your subscription will appear here after your first booking.</p>
          </div>
        ) : (
          subscriptions.map((sub) => {
            const days = daysLeft(sub.ends_at)
            const isExpired = sub.status !== "active" || days === 0
            return (
              <div
                key={sub.id}
                className={cn(
                  "rounded-xl border bg-card overflow-hidden",
                  isExpired && "opacity-70"
                )}
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {SERVICE_ICON[sub.service] ?? <CreditCard className="size-5" />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{SERVICE_LABEL[sub.service] ?? sub.service} Access</p>
                      {sub.is_free && (
                        <p className="text-xs text-muted-foreground">Included with your booking — free of charge</p>
                      )}
                    </div>
                  </div>
                  <StatusBadge sub={sub} />
                </div>

                {/* Details */}
                <div className="px-6 py-5 flex flex-col gap-5">
                  <ProgressBar sub={sub} />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" /> Start date
                      </p>
                      <p className="text-sm font-medium">{fmtDate(sub.starts_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" /> {isExpired ? "Expired on" : "Valid until"}
                      </p>
                      <p className={cn("text-sm font-medium", isExpired && "text-red-600")}>
                        {fmtDate(sub.ends_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
