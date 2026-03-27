"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Building2, Globe, MapPin, Search, ChevronsUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { HeaderActionButton } from "@/components/header-action-button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

export type EnrichedCompany = {
  id: string
  name: string
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  domains: string[]
  locations: string[]
  members: { id: string; name: string }[]
  totalBookings: number
}

type SortKey = "name" | "members" | "bookings"

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

function shortDesc(desc: string | null): string {
  if (!desc) return "—"
  const words = desc.split(" ")
  return words.length > 6 ? words.slice(0, 6).join(" ") + "…" : desc
}

const PAGE_SIZE = 10

function ColHeader({ label, sortKey, current, onSort }: {
  label: string
  sortKey: SortKey
  current: SortKey
  onSort: (k: SortKey) => void
}) {
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
    >
      {label}
      <ChevronsUpDown className={`size-3 shrink-0 ${current === sortKey ? "text-foreground" : "opacity-40"}`} />
    </button>
  )
}

export default function CompaniesClientPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("name")
  const [page, setPage] = useState(1)

  const { data: companies = [], isLoading } = useQuery<EnrichedCompany[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      console.log("[CompaniesClientPage] fetching /api/companies...")
      const res = await fetch("/api/companies")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      console.log(`[CompaniesClientPage] loaded ${data.length} companies`)
      return data
    },
  })

  function handleSort(k: SortKey) {
    setSort(k)
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const list = q
      ? companies.filter((c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q) ||
          c.domains.some((d) => d.toLowerCase().includes(q)) ||
          c.locations.some((l) => l.toLowerCase().includes(q))
        )
      : [...companies]

    list.sort((a, b) => {
      if (sort === "members")  return b.members.length - a.members.length
      if (sort === "bookings") return b.totalBookings - a.totalBookings
      return a.name.localeCompare(b.name)
    })

    return list
  }, [search, sort, companies])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <h1 className="text-lg font-semibold text-foreground">Companies</h1>
        </div>
        <HeaderActionButton label="Add Company" />
      </header>

      <div className="flex flex-col gap-4 p-6">

        {/* Skeleton while loading */}
        {isLoading && (
          <div className="rounded-xl border overflow-hidden bg-card">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[2fr_3fr_1.5fr_1.5fr_2fr_auto] items-center gap-3 px-5 py-3.5 border-b last:border-0">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="size-7 rounded-md shrink-0" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20 hidden lg:block" />
                <Skeleton className="h-4 w-20 hidden lg:block" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, domain, location…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border overflow-hidden bg-card">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Building2 className="size-8 mb-3 opacity-30" />
              <p className="text-sm">No companies found</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="grid grid-cols-[2fr_3fr_1.5fr_1.5fr_2fr_auto] items-center gap-3 px-5 py-3 border-b bg-muted/30">
                <ColHeader label="Company"  sortKey="name"     current={sort} onSort={handleSort} />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:block">Domains</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:block">Location</span>
                <ColHeader label="Members"  sortKey="members"  current={sort} onSort={handleSort} />
                <ColHeader label="Bookings" sortKey="bookings" current={sort} onSort={handleSort} />
              </div>

              {/* Rows */}
              {paginated.map((company) => {
                const primaryMember = company.members[0] ?? null
                return (
                  <div
                    key={company.id}
                    onClick={() => router.push(`/panel/companies/${company.id}`)}
                    className="grid grid-cols-[2fr_3fr_1.5fr_1.5fr_2fr_auto] items-center gap-3 px-5 py-3.5 border-b last:border-0 hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    {/* Company */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-7 rounded-md bg-muted flex items-center justify-center text-[11px] font-bold text-foreground shrink-0">
                        {initials(company.name)}
                      </div>
                      <span className="text-sm font-medium text-foreground truncate">{company.name}</span>
                    </div>

                    {/* Description */}
                    <span className="text-sm text-muted-foreground truncate">{shortDesc(company.description)}</span>

                    {/* Domains */}
                    <div className="hidden lg:flex items-center gap-1.5 min-w-0">
                      {company.domains.length === 0 ? (
                        <span className="text-sm text-muted-foreground">—</span>
                      ) : (
                        <>
                          <Globe className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm text-foreground truncate">{company.domains[0]}</span>
                          {company.domains.length > 1 && (
                            <span className="text-xs text-muted-foreground">+{company.domains.length - 1}</span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Location */}
                    <div className="hidden lg:flex items-center gap-1.5 min-w-0">
                      {company.locations.length === 0 ? (
                        <span className="text-sm text-muted-foreground">—</span>
                      ) : (
                        <>
                          <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm text-foreground truncate">{company.locations[0]}</span>
                          {company.locations.length > 1 && (
                            <span className="text-xs text-muted-foreground">+{company.locations.length - 1}</span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Primary contact */}
                    <div className="flex items-center gap-2 min-w-0">
                      {primaryMember ? (
                        <>
                          <div className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-foreground shrink-0">
                            {initials(primaryMember.name)}
                          </div>
                          <span className="text-sm text-foreground truncate">{primaryMember.name}</span>
                          {company.members.length > 1 && (
                            <span className="text-xs text-muted-foreground shrink-0">+{company.members.length - 1}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>

                    {/* Bookings */}
                    <div className="shrink-0">
                      {company.totalBookings > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground tabular-nums">
                          {company.totalBookings} booking{company.totalBookings !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)) }}
                  aria-disabled={page === 1}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === page}
                        onClick={(e) => { e.preventDefault(); setPage(p) }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }
                if (Math.abs(p - page) === 2) {
                  return <PaginationItem key={p}><PaginationEllipsis /></PaginationItem>
                }
                return null
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)) }}
                  aria-disabled={page === totalPages}
                  className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}

