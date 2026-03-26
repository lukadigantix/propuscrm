"use client"

import { use, useState } from "react"
import { notFound } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import BackButton from "@/components/back-button"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { INVOICES, COMPANY, type Invoice, type InvoiceStatus, type InvoiceLineItem } from "@/lib/data/invoices"
import {
  Printer,
  ChevronDown,
  Mail,
  CheckCircle2,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/* Constants                                                            */
/* ------------------------------------------------------------------ */

const STATUS_STYLE: Record<InvoiceStatus, string> = {
  Draft:     "bg-zinc-100 text-zinc-600",
  Sent:      "bg-blue-100 text-blue-700",
  Paid:      "bg-emerald-100 text-emerald-700",
  Overdue:   "bg-red-100 text-red-700",
  Cancelled: "bg-zinc-100 text-zinc-400",
}

const STATUS_OPTIONS: InvoiceStatus[] = ["Draft", "Sent", "Paid", "Overdue", "Cancelled"]

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function fmtCHF(n: number) {
  return n.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function deriveLineItems(inv: Invoice): InvoiceLineItem[] {
  if (inv.line_items && inv.line_items.length > 0) return inv.line_items
  return [{ description: inv.description, qty: 1, unit_price: inv.amount }]
}

/* ------------------------------------------------------------------ */
/* Page entry                                                           */
/* ------------------------------------------------------------------ */

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const invoice = INVOICES.find((inv) => inv.id === Number(id))
  if (!invoice) return notFound()
  return <InvoiceDetail invoice={invoice} />
}

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */

function InvoiceDetail({ invoice }: { invoice: Invoice }) {
  const [status, setStatus]         = useState<InvoiceStatus>(invoice.status)
  const [statusOpen, setStatusOpen] = useState(false)

  const lineItems = deriveLineItems(invoice)
  const subtotal  = lineItems.reduce((sum, li) => sum + li.qty * li.unit_price, 0)
  // Switzerland: no VAT shown (Kleinunternehmer / not registered)
  const total = subtotal

  return (
    <>
      {/* Print styles — injected via style tag */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .invoice-paper {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
          }
        }
        @media screen {
          .print-only { display: none; }
        }
      `}</style>

      <div className="min-h-screen bg-muted/40">

        {/* Header — screen only */}
        <header className="no-print sticky top-0 z-10 flex items-center gap-3 border-b bg-card px-6 py-4">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <BackButton label="Back" />
          <span className="text-sm font-medium text-muted-foreground">{invoice.invoice_number}</span>

          <div className="ml-auto flex items-center gap-2">
            {/* Status dropdown */}
            <div className="relative">
              <button
                onClick={() => setStatusOpen((o) => !o)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                  STATUS_STYLE[status]
                )}
              >
                {status}
                <ChevronDown className={cn("size-3 transition-transform", statusOpen && "rotate-180")} />
              </button>
              {statusOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-20 w-36 rounded-xl border bg-card shadow-lg overflow-hidden">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setStatus(s); setStatusOpen(false) }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-xs font-medium transition-colors hover:bg-muted",
                        status === s ? "bg-muted" : ""
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button size="sm" variant="outline" className="gap-1.5">
              <Mail className="size-3.5" />
              Send
            </Button>

            {status !== "Paid" && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                onClick={() => setStatus("Paid")}
              >
                <CheckCircle2 className="size-3.5" />
                Mark as paid
              </Button>
            )}

            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => window.print()}
            >
              <Printer className="size-3.5" />
              Print / PDF
            </Button>
          </div>
        </header>

        {/* Invoice paper */}
        <div className="py-8 px-4 print:p-0 print:py-0">
          <div className="invoice-paper mx-auto max-w-3xl bg-white shadow-md rounded-xl overflow-hidden print:rounded-none print:shadow-none print:max-w-none">

            {/* Top color bar */}
            <div className="h-1.5 bg-primary no-print" />

            <div className="px-12 py-10 print:px-10 print:py-8">

              {/* ── Company + Invoice header ────────────────────── */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-xl font-bold text-foreground">{COMPANY.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{COMPANY.address}</p>
                  <p className="text-sm text-muted-foreground">{COMPANY.city}</p>
                  <p className="text-sm text-muted-foreground mt-1">UID: {COMPANY.uid}</p>
                  <p className="text-sm text-muted-foreground">Tel: {COMPANY.phone}</p>
                  <p className="text-sm text-muted-foreground">{COMPANY.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold tracking-tight text-foreground">INVOICE</p>
                  <p className="text-lg font-semibold text-primary mt-1">{invoice.invoice_number}</p>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-foreground/60">Issue date:</span>
                      <span className="font-medium text-foreground">{fmtDate(invoice.issue_date)}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-foreground/60">Due date:</span>
                      <span className={cn("font-medium", status === "Overdue" ? "text-red-600" : "text-foreground")}>
                        {fmtDate(invoice.due_date)}
                      </span>
                    </div>
                    {invoice.paid_date && (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-foreground/60">Paid on:</span>
                        <span className="font-medium text-emerald-600">{fmtDate(invoice.paid_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Divider ─────────────────────────────────────── */}
              <div className="border-t mb-8" />

              {/* ── Bill to ─────────────────────────────────────── */}
              <div className="flex gap-12 mb-10">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Bill to</p>
                  <p className="text-sm font-semibold text-foreground">{invoice.contact_company}</p>
                  <p className="text-sm text-muted-foreground">{invoice.contact_name}</p>
                  <p className="text-sm text-muted-foreground">{invoice.contact_email}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Payment</p>
                  <p className="text-sm text-foreground">Bank transfer</p>
                  <p className="text-sm text-muted-foreground mt-1">IBAN: {COMPANY.iban}</p>
                  <p className="text-sm text-muted-foreground">{COMPANY.bank}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Reference: <span className="font-mono font-medium text-foreground">{invoice.invoice_number}</span>
                  </p>
                </div>
              </div>

              {/* ── Line items table ─────────────────────────────── */}
              <table className="w-full text-sm mb-8">
                <thead>
                  <tr className="border-b-2 border-foreground/20">
                    <th className="text-left py-2 pr-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground w-8">#</th>
                    <th className="text-left py-2 pr-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Description</th>
                    <th className="text-right py-2 pr-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground w-16">Qty</th>
                    <th className="text-right py-2 pr-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground w-28">Unit price</th>
                    <th className="text-right py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground w-28">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((li, i) => (
                    <tr key={i} className="border-b border-muted">
                      <td className="py-3 pr-4 text-muted-foreground">{i + 1}</td>
                      <td className="py-3 pr-4 text-foreground">{li.description}</td>
                      <td className="py-3 pr-4 text-right text-foreground">{li.qty}</td>
                      <td className="py-3 pr-4 text-right text-foreground">CHF {fmtCHF(li.unit_price)}</td>
                      <td className="py-3 text-right font-medium text-foreground">CHF {fmtCHF(li.qty * li.unit_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ── Totals ──────────────────────────────────────── */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>CHF {fmtCHF(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground/70 pb-2 border-b">
                    <span>VAT (0%)</span>
                    <span>—</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-foreground pt-1">
                    <span>Total due</span>
                    <span>CHF {fmtCHF(total)}</span>
                  </div>
                  {status === "Paid" && (
                    <div className="flex justify-between text-sm text-emerald-600 font-medium">
                      <span>Paid</span>
                      <span>CHF {fmtCHF(total)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Notes ───────────────────────────────────────── */}
              {invoice.notes && (
                <div className="mt-8 pt-6 border-t">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                </div>
              )}

              {/* ── Footer ──────────────────────────────────────── */}
              <div className="mt-12 pt-6 border-t flex items-end justify-between">
                <div className="text-xs text-muted-foreground/60 space-y-0.5">
                  <p>{COMPANY.name} · {COMPANY.address}, {COMPANY.city}</p>
                  <p>{COMPANY.website} · {COMPANY.email}</p>
                  <p className="mt-1">* Not subject to VAT pursuant to Art. 10 Para. 2 MWSTG</p>
                </div>
                <div className="text-right">
                  <div className="border-t border-foreground/30 pt-2 mt-8 w-40">
                    <p className="text-xs text-muted-foreground">Authorised signature</p>
                  </div>
                </div>
              </div>

              {/* PAID stamp */}
              {status === "Paid" && (
                <div className="absolute top-32 right-12 rotate-[-20deg] pointer-events-none select-none print:block">
                  <div className="border-4 border-emerald-500/60 rounded-lg px-4 py-2">
                    <p className="text-2xl font-extrabold tracking-widest text-emerald-500/60">PAID</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </>
  )
}
