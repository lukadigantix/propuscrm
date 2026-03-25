"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Link2, Camera, LayoutDashboard, ChevronRight, MapPin, Building2, CalendarDays, CheckCircle2, AlertCircle, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { MATTERPORT_BOOKINGS, getUnlinked, getUpcoming, type MatterportBooking } from "@/lib/data/matterport"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

const TABS = [
  { key: "overview", label: "Overview",        icon: LayoutDashboard },
  { key: "link",     label: "Matterport Link", icon: Link2            },
  { key: "tours",    label: "Tours",           icon: Camera           },
] as const

type Tab = typeof TABS[number]["key"]
type StatusFilter = "All" | "Linked" | "Unlinked"
type DateFilter   = "All" | "Upcoming" | "This month" | "Last 30 days" | "Last 3 months"
type CityFilter   = "All" | "Zürich" | "Genève" | "Basel" | "Bern"

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

const CITY_FILTERS: { label: string; value: CityFilter }[] = [
  { label: "All",    value: "All"    },
  { label: "Zürich", value: "Zürich" },
  { label: "Genève", value: "Genève" },
  { label: "Basel",  value: "Basel"  },
  { label: "Bern",   value: "Bern"   },
]

const PREVIEW_COUNT = 5
const PAGE_SIZE = 12

function matchesDate(date: string, filter: DateFilter): boolean {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  if (filter === "Upcoming")     return d >= today
  if (filter === "This month")   return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth()
  if (filter === "Last 30 days") { const ago = new Date(today); ago.setDate(ago.getDate() - 30); return d < today && d >= ago }
  if (filter === "Last 3 months") { const ago = new Date(today); ago.setMonth(ago.getMonth() - 3); return d < today && d >= ago }
  return true
}

export default function MatterportPage() {
  const router = useRouter()
  const [active, setActive]           = useState<Tab>("overview")
  const [search, setSearch]           = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
  const [dateFilter, setDateFilter]   = useState<DateFilter>("All")
  const [cityFilter, setCityFilter]   = useState<CityFilter>("All")
  const [page, setPage]               = useState(1)

  const unlinked = getUnlinked()
  const upcoming = getUpcoming()

  const filteredAll = useMemo(() => {
    const q = search.toLowerCase()
    return MATTERPORT_BOOKINGS.filter((b) => {
      if (statusFilter === "Linked")   { if (!b.matterport_link) return false }
      if (statusFilter === "Unlinked") { if (!!b.matterport_link) return false }
      if (cityFilter !== "All" && b.city !== cityFilter) return false
      if (!matchesDate(b.date, dateFilter)) return false
      if (q && !b.property_address.toLowerCase().includes(q) &&
               !b.contact_name.toLowerCase().includes(q) &&
               !b.contact_company.toLowerCase().includes(q) &&
               !b.city.toLowerCase().includes(q)) return false
      return true
    })
  }, [search, statusFilter, dateFilter, cityFilter])

  const totalPages = Math.max(1, Math.ceil(filteredAll.length / PAGE_SIZE))
  const paginated  = filteredAll.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function resetPage() { setPage(1) }

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
              viewAllHref="/panel/bookings"
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
            {/* Search + Filters */}
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
                      <Button
                        key={f.value}
                        variant={statusFilter === f.value ? "default" : "ghost"}
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={() => { setStatusFilter(f.value); resetPage() }}
                      >
                        {f.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Date</span>
                  <div className="flex gap-1 rounded-lg border p-1">
                    {DATE_FILTERS.map((f) => (
                      <Button
                        key={f.value}
                        variant={dateFilter === f.value ? "default" : "ghost"}
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={() => { setDateFilter(f.value); resetPage() }}
                      >
                        {f.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">City</span>
                  <div className="flex gap-1 rounded-lg border p-1">
                    {CITY_FILTERS.map((f) => (
                      <Button
                        key={f.value}
                        variant={cityFilter === f.value ? "default" : "ghost"}
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={() => { setCityFilter(f.value); resetPage() }}
                      >
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
                  <p className="text-sm">No bookings found.</p>
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
                        <p className="text-sm font-medium text-foreground truncate">{booking.property_address}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Building2 className="size-3 shrink-0" />
                          {booking.contact_name} · {booking.contact_company}
                        </p>
                      </div>
                      <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                        <CalendarDays className="size-3" />
                        {new Date(booking.date).toLocaleDateString("en-CH", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      <div className="hidden sm:flex shrink-0">
                        {booking.matterport_link ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="size-3" />Linked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                            <AlertCircle className="size-3" />Unlinked
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {filteredAll.length} booking{filteredAll.length !== 1 ? "s" : ""}
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
        )}

        {/* Tours */}
        {active === "tours" && (
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">No tours yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function BookingList({
  title,
  badge,
  badgeColor,
  items,
  viewAllHref,
  emptyText,
}: {
  title: string
  badge: number
  badgeColor: "amber" | "blue"
  items: MatterportBooking[]
  viewAllHref: string
  emptyText: string
}) {
  const badgeClass = badgeColor === "amber"
    ? "bg-amber-100 text-amber-700"
    : "bg-blue-100 text-blue-700"

  return (
    <div className="overflow-hidden rounded-xl border bg-card divide-y">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {badge > 0 && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
              {badge}
            </span>
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
            href={`/panel/matterport/${booking.id}`}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-background group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate group-hover:underline">{booking.property_address}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {booking.contact_name} · {booking.contact_company} · {new Date(booking.date).toLocaleDateString("en-CH", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground/60 shrink-0" />
          </Link>
        ))
      )}
    </div>
  )
}
