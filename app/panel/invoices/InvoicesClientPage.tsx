"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ContactAvatar } from "@/components/contact-avatar"
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious, PaginationEllipsis,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, FileText, ChevronRight, Camera, Box, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled"
export type InvoiceType   = "Photos" | "Matterport" | "Subscription"

export type DbInvoice = {
  id: string
  invoice_number: string
  contact_id: string | null
  contact_name: string
  contact_company: string | null
  type: InvoiceType
  description: string | null
  amount: number
  status: InvoiceStatus
  issue_date: string
  due_date: string
  paid_date: string | null
  notes: string | null
}

type StatusFilter = "All" | InvoiceStatus
type TypeFilter   = "All" | InvoiceType
type DateFilter   = "All" | "This month" | "Last 30 days" | "Last 3 months" | "This year"

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All",       value: "All"       },
  { label: "Draft",     value: "Draft"     },
  { label: "Sent",      value: "Sent"      },
  { label: "Paid",      value: "Paid"      },
  { label: "Overdue",   value: "Overdue"   },
  { label: "Cancelled", value: "Cancelled" },
]

const TYPE_FILTERS: { label: string; value: TypeFilter }[] = [
  { label: "All",          value: "All"          },
  { label: "Photos",       value: "Photos"       },
  { label: "Matterport",   value: "Matterport"   },
  { label: "Subscription", value: "Subscription" },
]

const DATE_FILTERS: { label: string; value: DateFilter }[] = [
  { label: "All",           value: "All"           },
  { label: "This month",    value: "This month"    },
  { label: "Last 30 days",  value: "Last 30 days"  },
  { label: "Last 3 months", value: "Last 3 months" },
  { label: "This year",     value: "This year"     },
]

const STATUS_STYLE: Record<InvoiceStatus, string> = {
  Draft:     "bg-zinc-100 text-zinc-600",
  Sent:      "bg-blue-100 text-blue-700",
  Paid:      "bg-emerald-100 text-emerald-700",
  Overdue:   "bg-red-100 text-red-700",
  Cancelled: "bg-zinc-100 text-zinc-400",
}

const TYPE_ICON: Record<InvoiceType, React.ReactNode> = {
  Photos:       <Camera className="size-3.5" />,
  Matterport:   <Box className="size-3.5" />,
  Subscription: <CreditCard className="size-3.5" />,
}

const PAGE_SIZE = 12

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-CH", { day: "numeric", month: "short", year: "numeric" })
}

function fmtCHF(n: number) {
  return `CHF ${n.toLocaleString("de-CH", { minimumFractionDigits: 2 })}`
}

function matchesDate(date: string, filter: DateFilter): boolean {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  if (filter === "This month")    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth()
  if (filter === "Last 30 days")  { const ago = new Date(today); ago.setDate(ago.getDate() - 30); return d >= ago && d <= today }
  if (filter === "Last 3 months") { const ago = new Date(today); ago.setMonth(ago.getMonth() - 3); return d >= ago && d <= today }
  if (filter === "This year")     return d.getFullYear() === today.getFullYear()
  return true
}

function InvoiceRow({ invoice, onClick }: { invoice: DbInvoice; onClick: () => void }) {
  const isOverdue = invoice.status === "Overdue"

  return (
    <div onClick={onClick} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer">
      <ContactAvatar name={invoice.contact_name} className="size-9 shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-sm font-medium">{invoice.invoice_number}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {TYPE_ICON[invoice.type]}
            {invoice.type}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{invoice.description ?? "—"}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{invoice.contact_company} · {invoice.contact_name}</p>
      </div>

      <div className="hidden md:flex flex-col items-end gap-1 shrink-0 text-xs text-muted-foreground">
        <span>Issued {fmtDate(invoice.issue_date)}</span>
        <span className={isOverdue ? "text-red-600 font-medium" : ""}>
          Due {fmtDate(invoice.due_date)}
        </span>
        {invoice.paid_date && (
          <span className="text-emerald-600">Paid {fmtDate(invoice.paid_date)}</span>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden sm:block text-sm font-semibold tabular-nums">{fmtCHF(invoice.amount)}</span>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_STYLE[invoice.status])}>
          {invoice.status}
        </span>
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
    </div>
  )
}

export default function InvoicesClientPage() {
  const router = useRouter()

  const { data: invoices = [], isLoading } = useQuery<DbInvoice[]>({
    queryKey: ["invoices"],
    queryFn: () => {
      console.log("[InvoicesClientPage] fetching /api/invoices...")
      return fetch("/api/invoices").then((r) => r.json())
    },
  })

  const [search, setSearch]             = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
  const [typeFilter, setTypeFilter]     = useState<TypeFilter>("All")
  const [dateFilter, setDateFilter]     = useState<DateFilter>("All")
  const [page, setPage]                 = useState(1)

  function resetPage() { setPage(1) }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return invoices.filter((inv) => {
      if (statusFilter !== "All" && inv.status !== statusFilter) return false
      if (typeFilter   !== "All" && inv.type   !== typeFilter)   return false
      if (!matchesDate(inv.issue_date, dateFilter)) return false
      if (q &&
        !inv.invoice_number.toLowerCase().includes(q) &&
        !inv.contact_name.toLowerCase().includes(q) &&
        !(inv.contact_company ?? "").toLowerCase().includes(q) &&
        !(inv.description ?? "").toLowerCase().includes(q)) return false
      return true
    })
  }, [search, statusFilter, typeFilter, dateFilter, invoices])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalPaid    = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0)
  const totalOpen    = invoices.filter((i) => i.status === "Sent" || i.status === "Draft").reduce((s, i) => s + i.amount, 0)
  const totalOverdue = invoices.filter((i) => i.status === "Overdue").reduce((s, i) => s + i.amount, 0)
  const countPaid    = invoices.filter((i) => i.status === "Paid").length
  const countOpen    = invoices.filter((i) => i.status === "Sent" || i.status === "Draft").length
  const countOverdue = invoices.filter((i) => i.status === "Overdue").length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card px-6 py-4">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <FileText className="size-4 text-muted-foreground" />
          <h1 className="text-lg font-semibold text-foreground">Invoices</h1>
          <div className="ml-auto">
            <Skeleton className="h-8 w-28" />
          </div>
        </header>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border bg-card p-5 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-full max-w-sm" />
          <div className="rounded-xl border bg-card overflow-hidden divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="size-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-6 w-20" />
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
        <FileText className="size-4 text-muted-foreground" />
        <h1 className="text-lg font-semibold text-foreground">Invoices</h1>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{invoices.length} invoices</span>
          <Button size="sm">+ New invoice</Button>
        </div>
      </header>

      <div className="p-6 space-y-5">

        {/* Summary strip */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card border-l-4 border-l-emerald-500 p-5">
            <p className="mb-1 text-xs text-emerald-500">Total paid</p>
            <p className="text-2xl font-bold text-emerald-500 tabular-nums">{fmtCHF(totalPaid)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{countPaid} invoice{countPaid !== 1 ? "s" : ""}</p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <p className="mb-1 text-xs text-muted-foreground">Open</p>
            <p className="text-2xl font-bold text-foreground tabular-nums">{fmtCHF(totalOpen)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{countOpen} invoice{countOpen !== 1 ? "s" : ""}</p>
          </div>
          <div className="rounded-xl border bg-card border-l-4 border-l-red-500 p-5">
            <p className="mb-1 text-xs text-red-500">Overdue</p>
            <p className="text-2xl font-bold text-red-500 tabular-nums">{fmtCHF(totalOverdue)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{countOverdue} invoice{countOverdue !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by number, contact, description…"
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
                  <Button key={f.value} variant={statusFilter === f.value ? "default" : "ghost"} size="sm"
                    className="h-7 px-3 text-xs" onClick={() => { setStatusFilter(f.value); resetPage() }}>
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Type</span>
              <div className="flex gap-1 rounded-lg border p-1">
                {TYPE_FILTERS.map((f) => (
                  <Button key={f.value} variant={typeFilter === f.value ? "default" : "ghost"} size="sm"
                    className="h-7 px-3 text-xs" onClick={() => { setTypeFilter(f.value); resetPage() }}>
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Period</span>
              <div className="flex gap-1 rounded-lg border p-1">
                {DATE_FILTERS.map((f) => (
                  <Button key={f.value} variant={dateFilter === f.value ? "default" : "ghost"} size="sm"
                    className="h-7 px-3 text-xs" onClick={() => { setDateFilter(f.value); resetPage() }}>
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
              <FileText className="size-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                {invoices.length === 0 ? "No invoices yet." : "No invoices found."}
              </p>
              {invoices.length > 0 && (
                <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your filters.</p>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {paginated.map((inv) => (
                <InvoiceRow key={inv.id} invoice={inv} onClick={() => router.push(`/panel/invoices/${inv.id}`)} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {filtered.length} invoice{filtered.length !== 1 ? "s" : ""}
          </p>
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
    </div>
  )
}
