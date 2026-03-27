"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Camera, Box, Video, CalendarDays } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
// import { BOOKINGS, type BookingStatus } from "@/lib/data/bookings"
// import { BookingStatusBadge } from "@/components/booking-status-badge"
import type { BookingStatus } from "@/lib/data/bookings"
import { ContactAvatar } from "@/components/contact-avatar"
import { HeaderActionButton } from "@/components/header-action-button"
import { useUser } from "@/context/UserContext"

export type DbBooking = {
  id: string
  date: string
  time: string | null
  service: string
  property_address: string | null
  status: string
  contact_id: string | null
  contact_name: string
  contact_company: string | null
}

const STATUS_TABS: { label: string; value: BookingStatus | "All" }[] = [
  { label: "All",         value: "All"         },
  { label: "Scheduled",   value: "Scheduled"   },
  { label: "In Progress", value: "In Progress" },
  { label: "Delivered",   value: "Delivered"   },
  { label: "Invoiced",    value: "Invoiced"    },
]

const SERVICE_ICON: Record<string, React.ReactNode> = {
  photos:     <Camera className="size-3" />,
  matterport: <Box className="size-3" />,
  both:       <><Camera className="size-3" /><Box className="size-3" /></>,
  Photos:     <Camera className="size-3" />,
  Matterport: <Box className="size-3" />,
  Video:      <Video className="size-3" />,
}

const SERVICE_LABEL: Record<string, string> = {
  photos:     "Photos",
  matterport: "Matterport",
  both:       "Photos + Matterport",
}

const STATUS_COLOR: Record<string, string> = {
  Scheduled:     "bg-amber-100 text-amber-800",
  "In Progress": "bg-purple-100 text-purple-800",
  Delivered:     "bg-green-100 text-green-800",
  Invoiced:      "bg-blue-100 text-blue-800",
  Cancelled:     "bg-red-100 text-red-800",
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr)
  return {
    month: d.toLocaleDateString("en-CH", { month: "short" }).toUpperCase(),
    day:   d.getDate(),
  }
}

export default function BookingsClientPage() {
  const router = useRouter()
  const { role, contactId } = useUser()
  const [search, setSearch] = useState("")
  const [tab, setTab]       = useState<BookingStatus | "All">("All")
  const [page, setPage]     = useState(1)
  const PAGE_SIZE = 10

  const { data: dbBookings = [], isLoading: loading, isError, error } = useQuery<DbBooking[]>({
    queryKey: ["bookings"],
    queryFn: async () => {
      console.log("[BookingsClientPage] fetching /api/bookings...")
      const headers: Record<string, string> = {}
      if (role) headers["x-user-role"] = role
      if (contactId) headers["x-contact-id"] = contactId
      const res = await fetch("/api/bookings", { headers })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      console.log(`[BookingsClientPage] loaded ${data.length} bookings`)
      return data
    },
  })

  // DB bookings — search + status filter
  const filteredDb = useMemo(() => {
    const q = search.toLowerCase()
    return dbBookings.filter((b) => {
      const matchTab    = tab === "All" || b.status === tab
      const matchSearch = !q ||
        b.contact_name.toLowerCase().includes(q) ||
        (b.contact_company ?? "").toLowerCase().includes(q) ||
        (b.property_address ?? "").toLowerCase().includes(q)
      return matchTab && matchSearch
    })
  }, [search, tab, dbBookings])

  // /* SAMPLE BOOKINGS — commented out
  // const filteredSample = useMemo(() => { ... }, [search, tab])
  // */

  const totalPages = Math.max(1, Math.ceil(filteredDb.length / PAGE_SIZE))
  const paginated  = filteredDb.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <h1 className="text-lg font-semibold text-foreground">Bookings</h1>
        </div>
        <HeaderActionButton label="New booking" onClick={() => router.push("/booking")} />
      </header>

      <div className="space-y-6 p-6">

        {/* Loading skeleton */}
        {loading && (
          <div className="overflow-hidden rounded-xl border bg-card divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="hidden sm:flex flex-col items-center gap-1 w-12 shrink-0">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-7 w-7" />
                </div>
                <Skeleton className="size-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="hidden md:block h-6 w-24 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            Failed to load bookings: {(error as Error)?.message}
          </div>
        )}

        {/* Content */}
        {!loading && !isError && (
        <>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by contact, address…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1 rounded-lg border bg-card p-1">
            {STATUS_TABS.map((t) => (
              <Button
                key={t.value}
                variant={tab === t.value ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => { setTab(t.value); setPage(1) }}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Bookings list */}
        <div className="overflow-hidden rounded-xl border bg-card">
          {filteredDb.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <CalendarDays className="size-8 mb-3 opacity-30" />
              <p className="text-sm">No bookings found</p>
            </div>
          ) : (
            <div className="divide-y">

              {paginated.map((booking) => {
                const { month, day } = fmtDate(booking.date)
                return (
                  <div
                    key={`db-${booking.id}`}
                    onClick={() => router.push(`/panel/bookings/${booking.id}`)}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-background transition-colors cursor-pointer"
                  >
                    {/* Date block */}
                    <div className="hidden sm:flex flex-col items-center justify-center w-12 shrink-0 text-center">
                      <span className="text-xs font-semibold text-foreground uppercase leading-none">{month}</span>
                      <span className="text-2xl font-bold text-foreground leading-tight">{day}</span>
                      <span className="text-xs text-muted-foreground">{booking.time ? booking.time.slice(0, 5) : "—"}</span>
                    </div>

                    <div className="hidden sm:block w-px self-stretch bg-muted shrink-0" />

                    {/* Contact */}
                    <ContactAvatar name={booking.contact_name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{booking.contact_name}</span>
                        {booking.contact_company && (
                          <span className="text-xs text-muted-foreground">{booking.contact_company}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{booking.property_address ?? "—"}</p>
                    </div>

                    {/* Service */}
                    <div className="hidden md:flex items-center gap-1.5 shrink-0">
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {SERVICE_ICON[booking.service]}
                        {SERVICE_LABEL[booking.service] ?? booking.service}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="shrink-0">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[booking.status] ?? "bg-muted text-zinc-700"}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                )
              })}

              {/* SAMPLE BOOKINGS REMOVED — uncomment filteredSample + paginatedSample to restore */}

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {filteredDb.length} booking{filteredDb.length !== 1 ? "s" : ""}
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
                      <PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer">{p}</PaginationLink>
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
        </>
        )}
      </div>
    </div>
  )
}
