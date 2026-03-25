"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Phone, Mail, Users, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { HeaderActionButton } from "@/components/header-action-button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { CONTACTS, type ContactStatus, type SubscriptionStatus } from "@/lib/data/contacts"

export type DbContact = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  company: string | null
  created_at: string
  booking_count: number
  last_booking_date: string | null
  matterport_sub_ends_at: string | null
}

const STATUS_FILTERS: { label: string; value: ContactStatus | "All" }[] = [
  { label: "All",      value: "All"      },
  { label: "Active",   value: "Active"   },
  { label: "Inactive", value: "Inactive" },
]

type SubBucket = "active" | "expiring" | "expired"
const SUB_FILTERS: { label: string; value: SubBucket | "All" }[] = [
  { label: "All",           value: "All"      },
  { label: "Active",        value: "active"   },
  { label: "Expiring soon", value: "expiring" },
  { label: "Expired",       value: "expired"  },
]

function daysLeft(ends_at: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.round((new Date(ends_at).getTime() - today.getTime()) / 86_400_000)
}

function getBucket(ends_at: string, status: SubscriptionStatus): SubBucket {
  if (status === "expired" || status === "cancelled") return "expired"
  return daysLeft(ends_at) <= 30 ? "expiring" : "active"
}

function SubscriptionBadge({ ends_at, status }: { ends_at: string; status: SubscriptionStatus }) {
  const bucket = getBucket(ends_at, status)
  const days   = daysLeft(ends_at)
  if (bucket === "expired")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
        <XCircle className="size-3" />Expired
      </span>
    )
  if (bucket === "expiring")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
        <AlertTriangle className="size-3" />{days}d left
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
      <CheckCircle2 className="size-3" />{days}d left
    </span>
  )
}

function DbSubscriptionBadge({ ends_at }: { ends_at: string }) {
  const days = daysLeft(ends_at)
  if (days <= 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
        <XCircle className="size-3" />Expired
      </span>
    )
  if (days <= 30)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
        <AlertTriangle className="size-3" />Expiring soon
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
      <CheckCircle2 className="size-3" />Paid
    </span>
  )
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

export default function ContactsClientPage({ dbContacts }: { dbContacts: DbContact[] }) {
  const router = useRouter()
  const [search, setSearch]             = useState("")
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "All">("All")
  const [subFilter, setSubFilter]       = useState<SubBucket | "All">("All")
  const [page, setPage]                 = useState(1)
  const PAGE_SIZE = 10

  const filteredDb = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return dbContacts
    return dbContacts.filter((c) =>
      c.full_name.toLowerCase().includes(q) ||
      (c.company ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q)
    )
  }, [search, dbContacts])

  const filteredSample = useMemo(() => {
    return CONTACTS.filter((c) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      const matchStatus = statusFilter === "All" || c.status === statusFilter
      const matchSub    = subFilter    === "All" || getBucket(c.subscription.ends_at, c.subscription.status) === subFilter
      return matchSearch && matchStatus && matchSub
    })
  }, [search, statusFilter, subFilter])

  const totalPages = Math.max(1, Math.ceil(filteredSample.length / PAGE_SIZE))
  const paginated  = filteredSample.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalCount = filteredDb.length + filteredSample.length

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <h1 className="text-lg font-semibold text-foreground">Contacts</h1>
        </div>
        <HeaderActionButton label="Add Contact" />
      </header>

      <div className="flex flex-col gap-6 p-6">

        {/* Search + Filters */}
        <div className="flex flex-col gap-3">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, company, email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Subscription</span>
              <div className="flex gap-1 rounded-lg border p-1">
                {SUB_FILTERS.map((f) => (
                  <Button
                    key={f.value}
                    variant={subFilter === f.value ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => { setSubFilter(f.value); setPage(1) }}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Status</span>
              <div className="flex gap-1 rounded-lg border p-1">
                {STATUS_FILTERS.map((f) => (
                  <Button
                    key={f.value}
                    variant={statusFilter === f.value ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => { setStatusFilter(f.value); setPage(1) }}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Combined list */}
        <div className="rounded-xl border overflow-hidden bg-card">
          {totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users className="size-8 mb-3 opacity-30" />
              <p className="text-sm">No contacts found</p>
            </div>
          ) : (
            <div className="divide-y">

              {/* DB contacts first */}
              {filteredDb.map((contact) => (
                <div
                  key={`db-${contact.id}`}
                  onClick={() => router.push(`/panel/contacts/${contact.id}`)}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <Avatar className="size-10 shrink-0">
                    <AvatarFallback className="text-sm font-medium">
                      {initials(contact.full_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm">{contact.full_name}</span>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {contact.company ?? "—"}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center shrink-0">
                    {contact.matterport_sub_ends_at && (
                      <DbSubscriptionBadge ends_at={contact.matterport_sub_ends_at} />
                    )}
                  </div>

                  <div className="hidden md:flex flex-col items-end gap-1 shrink-0 text-xs text-muted-foreground">
                    {contact.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="size-3" />{contact.email}
                      </span>
                    )}
                    {contact.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3" />{contact.phone}
                      </span>
                    )}
                  </div>

                  <div className="hidden lg:flex flex-col items-end gap-1 shrink-0 text-xs text-muted-foreground ml-4">
                    <span className="font-medium text-foreground">{contact.booking_count} bookings</span>
                    {contact.last_booking_date && (
                      <span>Last: {new Date(contact.last_booking_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Sample contacts below */}
              {paginated.map((contact) => (
                <div
                  key={`sample-${contact.id}`}
                  onClick={() => router.push(`/panel/contacts/${contact.id}`)}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <Avatar className="size-10 shrink-0">
                    <AvatarFallback className="text-sm font-medium">
                      {initials(contact.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{contact.name}</span>
                      {contact.status === "Inactive" && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {contact.role ? `${contact.role} · ` : ""}{contact.company} · {contact.city}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center shrink-0">
                    <SubscriptionBadge ends_at={contact.subscription.ends_at} status={contact.subscription.status} />
                  </div>

                  <div className="hidden md:flex flex-col items-end gap-1 shrink-0 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Mail className="size-3" />{contact.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="size-3" />{contact.phone}
                    </span>
                  </div>

                  <div className="hidden lg:flex flex-col items-end gap-1 shrink-0 text-xs text-muted-foreground ml-4">
                    <span className="font-medium text-foreground">{contact.bookings} bookings</span>
                    <span>Last: {contact.lastBooking}</span>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {filteredDb.length > 0 && `${filteredDb.length} real · `}{filteredSample.length} sample
          </p>
          {totalPages > 1 && (
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-disabled={page === 1}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  if (totalPages > 7 && p !== 1 && p !== totalPages && (p < page - 2 || p > page + 2)) {
                    if (p === page - 3 || p === page + 3) return <PaginationItem key={p}><PaginationEllipsis /></PaginationItem>
                    return null
                  }
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer">
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-disabled={page === totalPages}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>

      </div>
    </div>
  )
}
