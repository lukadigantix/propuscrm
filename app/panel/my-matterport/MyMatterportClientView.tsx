"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Box, CalendarDays, MapPin, ExternalLink, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DbClientMatterport } from "./page"

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-CH", { day: "numeric", month: "long", year: "numeric" })
}

const STATUS_STYLE: Record<string, string> = {
  Scheduled:     "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Delivered:     "bg-emerald-100 text-emerald-700",
  Invoiced:      "bg-violet-100 text-violet-700",
}

export default function MyMatterportClientView({ bookings }: { bookings: DbClientMatterport[] }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card px-6 py-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <Box className="size-4 text-muted-foreground" />
        <h1 className="text-sm font-medium">My Matterport Tours</h1>
      </header>

      <div className="p-6 max-w-2xl mx-auto flex flex-col gap-4">
        {bookings.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed bg-muted/20 flex flex-col items-center justify-center py-20 text-center">
            <Box className="size-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No Matterport tours yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Your 3D tour link will appear here once it&apos;s ready.</p>
          </div>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="size-4 text-muted-foreground shrink-0" />
                  <p className="text-sm font-semibold truncate">{b.property_address ?? "—"}</p>
                </div>
                <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-semibold", STATUS_STYLE[b.status] ?? "bg-muted text-muted-foreground")}>
                  {b.status}
                </span>
              </div>

              <div className="px-6 py-5 flex flex-col gap-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  {fmtDate(b.date)}{b.time ? ` · ${b.time}` : ""}
                </div>

                {b.matterport_link ? (
                  <a
                    href={b.matterport_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 px-4 py-3 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors"
                  >
                    <Box className="size-4" />
                    Open 3D Tour
                    <ExternalLink className="size-3.5 ml-auto" />
                  </a>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                    <Clock className="size-4 shrink-0" />
                    Your 3D tour is being processed — the link will appear here once it&apos;s ready.
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
