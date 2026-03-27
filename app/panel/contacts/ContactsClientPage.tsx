"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Users, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
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


export type DbContact = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  company_id: string | null
  company_name: string | null
  created_at: string
  booking_count: number
  last_booking_date: string | null
  matterport_sub_ends_at: string | null
}

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

function getDbBucket(matterport_sub_ends_at: string | null): SubBucket {
  if (!matterport_sub_ends_at) return "expired"
  const days = daysLeft(matterport_sub_ends_at)
  if (days <= 0) return "expired"
  return days <= 30 ? "expiring" : "active"
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

function relativeDate(dateStr: string): string {
  const diff = Math.round((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  if (diff < 30) return `${diff}d ago`
  if (diff < 365) return `${Math.round(diff / 30)}mo ago`
  return `${Math.round(diff / 365)}yr ago`
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

export default function ContactsClientPage() {
  const router = useRouter()
  const [search, setSearch]       = useState("")
  const [subFilter, setSubFilter] = useState<SubBucket | "All">("All")
  const [page, setPage]           = useState(1)
  const PAGE_SIZE = 10

  const { data: dbContacts = [], isLoading } = useQuery<DbContact[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      console.log("[ContactsClientPage] fetching /api/contacts...")
      const res = await fetch("/api/contacts")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      console.log(`[ContactsClientPage] loaded ${data.length} contacts`)
      return data
    },
  })

  const filteredDb = useMemo(() => {
    const q = search.toLowerCase()
    return dbContacts.filter((c) => {
      if (q &&
        !c.full_name.toLowerCase().includes(q) &&
        !(c.company_name ?? "").toLowerCase().includes(q) &&
        !(c.email ?? "").toLowerCase().includes(q)
      ) return false
      if (subFilter !== "All" && getDbBucket(c.matterport_sub_ends_at) !== subFilter) return false
      return true
    })
  }, [search, subFilter, dbContacts])

  const totalPages = Math.max(1, Math.ceil(filteredDb.length / PAGE_SIZE))
  const paginated  = filteredDb.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalCount = filteredDb.length

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

        {/* Skeleton while loading */}
        {isLoading && (
          <div className="rounded-xl border overflow-hidden bg-card">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-5 px-5 py-3.5 border-b last:border-0">
                <Skeleton className="size-8 rounded-full shrink-0" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-24 hidden sm:block" />
                <Skeleton className="h-4 w-40 hidden md:block flex-1" />
                <Skeleton className="h-4 w-28 hidden md:block" />
              </div>
            ))}
          </div>
        )}

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
              {/* Header row */}
              <div className="flex items-center gap-5 px-5 py-2.5 bg-muted/30">
                <div className="size-8 shrink-0" />
                <div className="w-44 shrink-0">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</span>
                </div>
                <div className="w-36 shrink-0 hidden sm:block">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Company</span>
                </div>
                <div className="flex-1 min-w-0 hidden md:block">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</span>
                </div>
                <div className="w-36 shrink-0 hidden lg:block">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</span>
                </div>
                <div className="w-28 shrink-0 hidden md:block">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subscription</span>
                </div>
                <div className="w-28 shrink-0 hidden lg:block text-right">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last booking</span>
                </div>
                <div className="w-24 shrink-0 hidden xl:block text-right">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bookings</span>
                </div>
              </div>

              {paginated.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => router.push(`/panel/contacts/${contact.id}`)}
                  className="flex items-center gap-5 px-5 py-3.5 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  {/* Avatar */}
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="text-xs font-semibold">
                      {initials(contact.full_name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name */}
                  <div className="w-44 shrink-0">
                    <span className="text-sm font-semibold text-foreground">{contact.full_name}</span>
                  </div>

                  {/* Company */}
                  <div className="w-36 shrink-0 hidden sm:block">
                    {contact.company_name
                      ? <span className="inline-block rounded-full bg-muted px-3 py-0.5 text-xs font-semibold text-foreground truncate max-w-full">{contact.company_name}</span>
                      : <span className="text-sm text-muted-foreground">—</span>
                    }
                  </div>

                  {/* Email */}
                  <div className="flex-1 min-w-0 hidden md:block">
                    <span className="text-sm text-muted-foreground truncate block">{contact.email ?? "—"}</span>
                  </div>

                  {/* Phone */}
                  <div className="w-36 shrink-0 hidden lg:block">
                    <span className="text-sm text-muted-foreground">{contact.phone ?? "—"}</span>
                  </div>

                  {/* Sub badge */}
                  <div className="w-28 shrink-0 hidden md:flex">
                    {contact.matterport_sub_ends_at
                      ? <DbSubscriptionBadge ends_at={contact.matterport_sub_ends_at} />
                      : <span className="text-xs text-muted-foreground">—</span>
                    }
                  </div>

                  {/* Last booking */}
                  <div className="w-28 shrink-0 hidden lg:block text-right">
                    <span className="text-sm text-muted-foreground">
                      {contact.last_booking_date ? relativeDate(contact.last_booking_date) : "—"}
                    </span>
                  </div>

                  {/* Bookings count */}
                  <div className="w-24 shrink-0 hidden xl:block text-right">
                    <span className="text-sm font-semibold text-foreground">{contact.booking_count}</span>
                    <span className="text-xs text-muted-foreground ml-1">{contact.booking_count === 1 ? "booking" : "bookings"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {totalCount} contact{totalCount !== 1 ? "s" : ""}
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
