"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Link2, Camera, LayoutDashboard, ChevronRight, MapPin, Building2,
  CalendarDays, Search, ExternalLink, Box,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious, PaginationEllipsis,
} from "@/components/ui/pagination"

export type MatterportStatus = "scheduled" | "pending" | "linked" | "archived"

export type DbMatterportBooking = {
  id: string
  date: string
  time: string | null
  service: string
  property_address: string | null
  property_type: string | null
  rooms: string | null
  status: string
  matterport_status: MatterportStatus
  matterport_link: string | null
  contact_name: string
  contact_company: string | null
  contact_id: string | null
}

const MP_STATUS_BADGE: Record<MatterportStatus, string> = {
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  pending:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  linked:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  archived:  "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
}
const MP_STATUS_LABEL: Record<MatterportStatus, string> = {
  scheduled: "Scheduled",
  pending:   "Pending link",
  linked:    "Linked",
  archived:  "Archived",
}

export type DbMatterportTour = {
  id: string
  contact_id: string
  contact_name: string
  contact_company: string | null
  sub_ends_at: string
  sub_status: string
}

const TABS = [
  { key: "overview", label: "Overview",        icon: LayoutDashboard },
  { key: "link",     label: "Matterport Link", icon: Link2            },
  { key: "tours",    label: "Tours",           icon: Camera           },
] as const

type Tab = typeof TABS[number]["key"]
type StatusFilter = "All" | "Linked" | "Unlinked"
type DateFilter   = "All" | "Upcoming" | "This month" | "Last 30 days" | "Last 3 months"

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All",      value: "All"      },
  { label: "Linked",   value: "Linked"   },
  { label: "Unlinked", value: "Unlinked" },
]

const DATE_FILTERS: { label: string; value: DateFilter }[] = [
  { label: "All",          value: "All"          },
  { label: "Upcoming",     value: "Upcoming"     },
  { label: "This month",   value: "This month"   },
  { label: "Last 30 days", value: "Last 30 days" },
  { label: "Last 3 months",value: "Last 3 months"},
]

const PAGE_SIZE = 12
const PREVIEW_COUNT = 5

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-CH", { day: "numeric", month: "short", year: "numeric" })
}

function matchesDate(date: string, filter: DateFilter): boolean {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  if (filter === "Upcoming")     return d >= today
  if (filter === "This month")   return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth()
  if (filter === "Last 30 days") { const ago = new Date(today); ago.setDate(ago.getDate() - 30); return d < today && d >= ago }
  if (filter === "Last 3 months") { const ago = new Date(today); ago.setMonth(ago.getMonth() - 3); return d < today && d >= ago }
  return true
}

function BookingList({
  title, badge, badgeColor, items, viewAllHref, emptyText,
}: {
  title: string; badge: number; badgeColor: "amber" | "blue"
  items: DbMatterportBooking[]; viewAllHref: string; emptyText: string
}) {
  const badgeClass = badgeColor === "amber" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
  return (
    <div className="overflow-hidden rounded-xl border bg-card divide-y">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {badge > 0 && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>{badge}</span>
          )}
        </div>
        <Link href={viewAllHref} className="text-xs text-muted-foreground hover:text-zinc-700 hover:underline">
          View all
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="px-5 py-4">
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        </div>
      ) : (
        items.map((booking) => (
          <Link
            key={booking.id}
            href={`/panel/matterport/tours/${booking.id}`}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-background group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate group-hover:underline">{booking.property_address ?? "—"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {booking.contact_name} · {booking.contact_company} · {fmtDate(booking.date)}
              </p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground/60 shrink-0" />
          </Link>
        ))
      )}
    </div>
  )
}

export default function MatterportClientPage() {
  const router = useRouter()

  const { data, isLoading } = useQuery<{ bookings: DbMatterportBooking[]; tours: DbMatterportTour[] }>({
    queryKey: ["matterport"],
    queryFn: () => {
      console.log("[MatterportClientPage] fetching /api/matterport...")
      return fetch("/api/matterport").then((r) => r.json())
    },
  })

  const bookings = useMemo(() => data?.bookings ?? [], [data])

  const [active, setActive]          = useState<Tab>("overview")
  const [search, setSearch]          = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
  const [dateFilter, setDateFilter]  = useState<DateFilter>("All")
  const [page, setPage]              = useState(1)
  const [tourSearch, setTourSearch]  = useState("")
  const [tourFilter, setTourFilter]  = useState<"All" | "Upcoming" | "Linked" | "Unlinked">("All")

  const unlinked = bookings.filter((b) => !b.matterport_link && new Date(b.date) < TODAY)
  const upcoming = bookings.filter((b) => new Date(b.date) >= TODAY).sort((a, b) => a.date.localeCompare(b.date))

  const filteredAll = useMemo(() => {
    const q = search.toLowerCase()
    return bookings.filter((b) => {
      if (statusFilter === "Linked"  && !b.matterport_link) return false
      if (statusFilter === "Unlinked" && !!b.matterport_link) return false
      if (!matchesDate(b.date, dateFilter)) return false
      if (q && !(b.property_address ?? "").toLowerCase().includes(q) &&
               !b.contact_name.toLowerCase().includes(q) &&
               !(b.contact_company ?? "").toLowerCase().includes(q)) return false
      return true
    })
  }, [search, statusFilter, dateFilter, bookings])

  const totalPages = Math.max(1, Math.ceil(filteredAll.length / PAGE_SIZE))
  const paginated  = filteredAll.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const filteredTourBookings = useMemo(() => {
    const q = tourSearch.toLowerCase()
    return bookings.filter((b) => {
      const isUpcoming = new Date(b.date) >= TODAY
      if (tourFilter === "Upcoming" && !isUpcoming) return false
      if (tourFilter === "Linked" && !b.matterport_link) return false
      if (tourFilter === "Unlinked" && (!!b.matterport_link || isUpcoming)) return false
      if (q && !(b.property_address ?? "").toLowerCase().includes(q) &&
               !b.contact_name.toLowerCase().includes(q) &&
               !(b.contact_company ?? "").toLowerCase().includes(q)) return false
      return true
    })
  }, [tourSearch, tourFilter, bookings])

  function resetPage() { setPage(1) }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card px-6 py-4">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <h1 className="text-lg font-semibold text-foreground">Matterport</h1>
        </header>
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-72" />
          <div className="rounded-xl border bg-card overflow-hidden divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-6 w-20 hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card px-6 py-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <h1 className="text-lg font-semibold text-foreground">Matterport</h1>
      </header>

      <div className="p-6 space-y-6">
        {/* Tab bar */}
        <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                active === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {active === "overview" && (
          <div className="space-y-5">
            <BookingList
              title="Awaiting Matterport Link"
              badge={unlinked.length}
              badgeColor="amber"
              items={unlinked.slice(0, PREVIEW_COUNT)}
              viewAllHref="/panel/matterport?tab=link"
              emptyText="All bookings have been linked."
            />
            <BookingList
              title="Upcoming Tours"
              badge={upcoming.length}
              badgeColor="blue"
              items={upcoming.slice(0, PREVIEW_COUNT)}
              viewAllHref="/panel/bookings"
              emptyText="No upcoming Matterport shoots."
            />
          </div>
        )}

        {/* Matterport Link */}
        {active === "link" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by address, contact, company…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); resetPage() }}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-4 flex-wrap items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Link</span>
                  <div className="flex gap-1 rounded-lg border p-1">
                    {STATUS_FILTERS.map((f) => (
                      <Button key={f.value} variant={statusFilter === f.value ? "default" : "ghost"} size="sm" className="h-7 px-3 text-xs"
                        onClick={() => { setStatusFilter(f.value); resetPage() }}>
                        {f.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Date</span>
                  <div className="flex gap-1 rounded-lg border p-1">
                    {DATE_FILTERS.map((f) => (
                      <Button key={f.value} variant={dateFilter === f.value ? "default" : "ghost"} size="sm" className="h-7 px-3 text-xs"
                        onClick={() => { setDateFilter(f.value); resetPage() }}>
                        {f.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border overflow-hidden bg-card">
              {paginated.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <p className="text-sm">{bookings.length === 0 ? "No Matterport bookings yet." : "No bookings found."}</p>
                </div>
              ) : (
                <div className="divide-y">
                  {paginated.map((booking) => (
                    <div
                      key={booking.id}
                      onClick={() => router.push(`/panel/matterport/${booking.id}`)}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <MapPin className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{booking.property_address ?? "—"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Building2 className="size-3 shrink-0" />
                          {booking.contact_name} · {booking.contact_company}
                        </p>
                      </div>
                      <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                        <CalendarDays className="size-3" />
                        {fmtDate(booking.date)}
                      </div>
                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${MP_STATUS_BADGE[booking.matterport_status]}`}>
                          {MP_STATUS_LABEL[booking.matterport_status]}
                        </span>
                        {booking.matterport_link && (
                          <a href={booking.matterport_link} target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-foreground">
                            <ExternalLink className="size-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{filteredAll.length} booking{filteredAll.length !== 1 ? "s" : ""}</p>
              {totalPages > 1 && (
                <Pagination className="w-auto mx-0">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} aria-disabled={page === 1}
                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      if (totalPages > 7 && p !== 1 && p !== totalPages && (p < page - 2 || p > page + 2)) {
                        if (p === page - 3 || p === page + 3) return <PaginationItem key={p}><PaginationEllipsis /></PaginationItem>
                        return null
                      }
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer">{p}</PaginationLink>
                        </PaginationItem>
                      )
                    })}
                    <PaginationItem>
                      <PaginationNext onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-disabled={page === totalPages}
                        className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        )}

        {/* Tours */}
        {active === "tours" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Search by address, contact, company…" value={tourSearch}
                  onChange={(e) => setTourSearch(e.target.value)} className="pl-9" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Status</span>
                <div className="flex gap-1 rounded-lg border p-1">
                  {(["All", "Upcoming", "Linked", "Unlinked"] as const).map((f) => (
                    <Button key={f} variant={tourFilter === f ? "default" : "ghost"} size="sm" className="h-7 px-3 text-xs"
                      onClick={() => setTourFilter(f)}>
                      {f}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
              {filteredTourBookings.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  {bookings.length === 0 ? "No Matterport tours yet." : "No tours found."}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Property</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-widest hidden md:table-cell">Contact</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">Date</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Status</th>
                      <th className="px-4 py-3 w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTourBookings.map((b) => {
                      return (
                        <tr
                          key={b.id}
                          onClick={() => router.push(`/panel/matterport/tours/${b.id}`)}
                          className="hover:bg-muted/50 transition-colors cursor-pointer group"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="size-8 rounded-lg bg-foreground flex items-center justify-center shrink-0">
                                <Box className="size-4 text-background" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{b.property_address ?? "—"}</p>
                                {b.property_type && <p className="text-xs text-muted-foreground capitalize">{b.property_type}{b.rooms ? ` · ${b.rooms} rooms` : ""}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 hidden md:table-cell">
                            <p className="text-sm text-foreground truncate">{b.contact_name}</p>
                            {b.contact_company && <p className="text-xs text-muted-foreground truncate">{b.contact_company}</p>}
                          </td>
                          <td className="px-4 py-3.5 hidden sm:table-cell">
                            <span className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">{fmtDate(b.date)}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${MP_STATUS_BADGE[b.matterport_status]}`}>
                              {MP_STATUS_LABEL[b.matterport_status]}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <p className="text-xs text-muted-foreground px-1">{filteredTourBookings.length} tour{filteredTourBookings.length !== 1 ? "s" : ""}</p>
          </div>
        )}

      </div>
    </div>
  )
}
