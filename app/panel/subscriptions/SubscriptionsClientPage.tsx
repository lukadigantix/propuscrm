"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Bell, RefreshCcw } from "lucide-react"
import { SubscriptionBadge, daysLeft, getSubBucket } from "@/components/subscription-badge"
import type { SubscriptionStatus } from "@/lib/data/contacts"
import { ContactAvatar } from "@/components/contact-avatar"
import { FilterTabs } from "@/components/filter-tabs"
import { fmt } from "@/lib/fmt"

export type DbSubContact = {
  id: string
  full_name: string
  company: string | null
  sub_starts_at: string
  sub_ends_at: string
  sub_status: SubscriptionStatus
}

type Section = "expiring" | "active" | "expired"

const SECTION_TABS: { label: string; value: Section | "all" }[] = [
  { label: "All",           value: "all"      },
  { label: "Expiring soon", value: "expiring" },
  { label: "Active",        value: "active"   },
  { label: "Expired",       value: "expired"  },
]

const SECTION_STYLES: Record<Section, { accent: string; icon: React.ReactNode }> = {
  expiring: { accent: "border-l-4 border-l-amber-500", icon: <AlertTriangle className="size-4 text-amber-500" /> },
  active:   { accent: "border-l-4 border-l-emerald-500", icon: <span className="size-2 rounded-full bg-emerald-500 inline-block mt-1" /> },
  expired:  { accent: "border-l-4 border-l-red-500",   icon: <span className="size-2 rounded-full bg-red-500 inline-block mt-1" /> },
}

const SECTION_LABEL: Record<Section, string> = {
  expiring: "Expiring soon",
  active:   "Active",
  expired:  "Expired",
}

export default function SubscriptionsClientPage({ contacts }: { contacts: DbSubContact[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<Section | "all">("all")

  const buckets = useMemo(() => ({
    expiring: contacts
      .filter((c) => getSubBucket(c.sub_ends_at, c.sub_status) === "expiring")
      .sort((a, b) => daysLeft(a.sub_ends_at) - daysLeft(b.sub_ends_at)),
    active: contacts
      .filter((c) => getSubBucket(c.sub_ends_at, c.sub_status) === "active")
      .sort((a, b) => daysLeft(a.sub_ends_at) - daysLeft(b.sub_ends_at)),
    expired: contacts
      .filter((c) => getSubBucket(c.sub_ends_at, c.sub_status) === "expired"),
  }), [contacts])

  const allSections: Section[] = ["expiring", "active", "expired"]
  const visible = tab === "all" ? allSections : [tab as Section]
  const total = contacts.length

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card px-6 py-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <h1 className="text-lg font-semibold text-foreground">Subscriptions</h1>
      </header>

      <div className="space-y-8 p-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border bg-card p-5">
            <p className="mb-1 text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{total}</p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <p className="mb-1 text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-foreground">{buckets.active.length}</p>
          </div>
          <div className="rounded-xl border bg-card border-l-4 border-l-amber-500 p-5">
            <p className="mb-1 text-xs text-amber-500">Expiring soon</p>
            <p className="text-2xl font-bold text-amber-500">{buckets.expiring.length}</p>
          </div>
          <div className="rounded-xl border bg-card border-l-4 border-l-red-500 p-5">
            <p className="mb-1 text-xs text-red-500">Expired</p>
            <p className="text-2xl font-bold text-red-500">{buckets.expired.length}</p>
          </div>
        </div>

        {/* Info box */}
        <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground space-y-1.5">
          <p className="font-semibold text-foreground mb-2">How subscriptions work</p>
          <p>Every new contact gets <strong>6 months</strong> access from the date their account is created.</p>
          <p>Renewal adds another <strong>6 months</strong> to the current end date.</p>
          <p>Clients can renew online (Payrexx) or via manual invoice.</p>
          <p>If a client&apos;s access expires without renewal, their login is deactivated — all data is kept.</p>
          <p>Returning after expiry: a <strong>15% late renewal fee</strong> applies.</p>
          <p>Reminder emails go out at 1 month, 2 weeks, 1 week, 3 days, and 1 day before expiry.</p>
        </div>

        {/* Filter tabs */}
        <FilterTabs tabs={SECTION_TABS} value={tab} onChange={setTab} />

        {total === 0 && (
          <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <p className="text-sm">No subscriptions yet.</p>
          </div>
        )}

        {/* Sections */}
        {visible.map((section) => {
          const subs = buckets[section]
          const { accent, icon } = SECTION_STYLES[section]
          return (
            <div key={section} className={"overflow-hidden rounded-2xl border bg-card " + accent}>
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-2">
                  {icon}
                  <span className="font-semibold text-foreground">{SECTION_LABEL[section]}</span>
                  <span className="text-xs text-muted-foreground">({subs.length})</span>
                </div>
                {section === "expiring" && subs.length > 0 && (
                  <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1">
                    <Bell className="size-3" />Send reminders
                  </Button>
                )}
              </div>

              {subs.length === 0 ? (
                <div className="flex items-center justify-center bg-card py-10 text-sm text-muted-foreground">
                  No contacts in this category
                </div>
              ) : (
                <div className="divide-y bg-card">
                  {subs.map((contact) => {
                    const isExpired = section === "expired"
                    return (
                      <div
                        key={contact.id}
                        onClick={() => router.push("/panel/contacts/" + contact.id)}
                        className="flex w-full items-center justify-between px-6 py-3.5 cursor-pointer transition-colors hover:bg-background"
                      >
                        <div className="flex items-center gap-3">
                          <ContactAvatar name={contact.full_name} />
                          <div>
                            <p className="text-sm font-medium text-foreground">{contact.full_name}</p>
                            <p className="text-xs text-muted-foreground">{contact.company ?? "—"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-right text-xs text-muted-foreground">
                          <div className="hidden sm:block">
                            <p className="text-muted-foreground">Started</p>
                            <p>{fmt(contact.sub_starts_at)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{isExpired ? "Expired" : "Expires"}</p>
                            <p className={isExpired ? "text-red-600 font-medium" : section === "expiring" ? "text-amber-700 font-medium" : ""}>
                              {fmt(contact.sub_ends_at)}
                            </p>
                          </div>
                          {!isExpired && (
                            <div className="w-28">
                              <SubscriptionBadge ends_at={contact.sub_ends_at} status={contact.sub_status} />
                            </div>
                          )}
                          <Button size="sm" variant="outline" className="h-7 px-3 text-xs" onClick={(e) => e.stopPropagation()}>
                            <RefreshCcw className="size-3 mr-1" />
                            {isExpired ? "Reactivate" : "Renew"}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
