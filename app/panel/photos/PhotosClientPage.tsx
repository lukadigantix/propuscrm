"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  Camera,
  MapPin,
  Building2,
  CalendarDays,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ContactAvatar } from "@/components/contact-avatar"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

export type DbPhotoJob = {
  id: string
  date: string
  time: string | null
  service: string
  property_address: string | null
  property_type: string | null
  rooms: string | null
  square_meters: number | null
  status: string
  contact_name: string
  contact_company: string | null
}

type StatusFilter = "All" | "Scheduled" | "In Progress" | "Delivered" | "Invoiced"
type DateFilter = "All" | "Upcoming" | "This month" | "Last 30 days" | "Last 3 months"

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All",         value: "All"         },
  { label: "Scheduled",   value: "Scheduled"   },
  { label: "In Progress", value: "In Progress" },
  { label: "Delivered",   value: "Delivered"   },
  { label: "Invoiced",    value: "Invoiced"    },
]

const DATE_FILTERS: { label: string; value: DateFilter }[] = [
  { label: "All",           value: "All"           },
  { label: "Upcoming",      value: "Upcoming"      },
  { label: "This month",    value: "This month"    },
  { label: "Last 30 days",  value: "Last 30 days"  },
  { label: "Last 3 months", value: "Last 3 months" },
]

const STATUS_STYLE: Record<string, string> = {
  "Scheduled":   "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  "Delivered":   "bg-emerald-100 text-emerald-700",
  "Invoiced":    "bg-violet-100 text-violet-700",
}

const PAGE_SIZE = 12

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-CH", { day: "numeric", month: "short", year: "numeric" })
}

function matchesDate(date: string, filter: DateFilter): boolean {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  if (filter === "Upcoming")      return d >= today
  if (filter === "This month")    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth()
  if (filter === "Last 30 days")  { const ago = new Date(today); ago.setDate(ago.getDate() - 30); return d < today && d >= ago }
  if (filter === "Last 3 months") { const ago = new Date(today); ago.setMonth(ago.getMonth() - 3); return d < today && d >= ago }
  return true
}

function PhotoJobRow({ job, onClick }: { job: DbPhotoJob; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
    >
      <ContactAvatar name={job.contact_name} className="size-9 shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-sm font-medium truncate">{job.contact_company ?? job.contact_name}</span>
          {job.contact_company && (
            <span className="text-xs text-muted-foreground truncate">— {job.contact_name}</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {job.property_address && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3 shrink-0" />
              {job.property_address}
            </span>
          )}
          {job.property_type && (
            <span className="flex items-center gap-1">
              <Building2 className="size-3 shrink-0" />
              {job.property_type}
              {job.rooms && ` · ${job.rooms} rooms`}
              {job.square_meters && ` · ${job.square_meters} m²`}
            </span>
          )}
        </div>
      </div>

      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarDays className="size-3" />
          {fmtDate(job.date)}{job.time ? ` · ${job.time}` : ""}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_STYLE[job.status] ?? "bg-muted text-zinc-700")}>
          {job.status}
        </span>
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
    </div>
  )
}

export default function PhotosClientPage({ jobs }: { jobs: DbPhotoJob[] }) {
  const router = useRouter()

  const [search, setSearch]           = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
  const [dateFilter, setDateFilter]   = useState<DateFilter>("All")
  const [page, setPage]               = useState(1)

  function resetPage() { setPage(1) }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return jobs.filter((j) => {
      if (statusFilter !== "All" && j.status !== statusFilter) return false
      if (!matchesDate(j.date, dateFilter)) return false
      if (q &&
        !j.contact_name.toLowerCase().includes(q) &&
        !(j.contact_company ?? "").toLowerCase().includes(q) &&
        !(j.property_address ?? "").toLowerCase().includes(q)) return false
      return true
    })
  }, [search, statusFilter, dateFilter, jobs])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card px-6 py-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <Camera className="size-4 text-muted-foreground" />
        <h1 className="text-lg font-semibold text-foreground">Photos</h1>
        <span className="ml-auto text-sm text-muted-foreground">{jobs.length} jobs total</span>
      </header>

      <div className="p-6 space-y-5">

        {/* Filters */}
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
              <span className="text-xs text-muted-foreground">Status</span>
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
          </div>
        </div>

        {/* List */}
        <div className="rounded-xl border bg-card overflow-hidden">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Camera className="size-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No jobs found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {jobs.length === 0 ? "No photo shoots booked yet." : "Try adjusting your filters."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {paginated.map((job) => (
                <PhotoJobRow
                  key={job.id}
                  job={job}
                  onClick={() => router.push(`/panel/photos/${job.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {filtered.length} job{filtered.length !== 1 ? "s" : ""}
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
