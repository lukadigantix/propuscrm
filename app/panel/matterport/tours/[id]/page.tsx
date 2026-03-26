import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import BackButton from "@/components/back-button"
import Link from "next/link"
import {
  CalendarDays, Clock, MapPin, Box, Home, Layers, ExternalLink,
  CheckCircle2, AlertTriangle, XCircle, ParkingCircle, Sofa,
  Mail, Phone, Link2, Archive, Loader2,
} from "lucide-react"
import { saveMatterportLink, setMatterportPending, setMatterportArchived } from "./actions"

function daysLeft(ends_at: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((new Date(ends_at).getTime() - today.getTime()) / 86_400_000)
}

function fmt(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-CH", { day: "numeric", month: "long", year: "numeric" })
}

type MatterportStatus = "scheduled" | "pending" | "linked" | "archived"

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

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: booking } = await admin
    .from("bookings")
    .select(`
      id, date, time, service, status,
      property_address, property_type, rooms, square_meters, parking, furnished, access_notes,
      created_at, contact_id, matterport_link, matterport_status,
      contacts(id, full_name, email, phone, company)
    `)
    .eq("id", id)
    .in("service", ["matterport", "both"])
    .single()

  if (!booking) notFound()

  const contact = (Array.isArray(booking.contacts) ? booking.contacts[0] : booking.contacts) as {
    id: string
    full_name: string
    email: string | null
    phone: string | null
    company: string | null
  } | null

  let sub: { status: string; ends_at: string } | null = null
  if (booking.contact_id) {
    const { data } = await admin
      .from("subscriptions")
      .select("status, ends_at")
      .eq("contact_id", booking.contact_id)
      .eq("service", "matterport")
      .neq("status", "cancelled")
      .order("ends_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    sub = data
  }

  const shortId = booking.id.slice(0, 8).toUpperCase()
  const matterportLink = booking.matterport_link as string | null ?? null
  const mpStatus = (booking.matterport_status as MatterportStatus) ?? "scheduled"

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card px-6 py-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <BackButton label="Back" />
        <span className="text-muted-foreground text-sm">/</span>
        <span className="text-sm text-foreground font-medium truncate">{booking.property_address ?? "Tour"}</span>
      </header>

      <div className="flex-1 p-6 flex flex-col gap-6">

        {/* Header card */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground">{shortId}</span>
                {/* Matterport lifecycle status */}
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${MP_STATUS_BADGE[mpStatus]}`}>
                  {mpStatus === "scheduled" && <CalendarDays className="size-3" />}
                  {mpStatus === "pending"   && <Loader2 className="size-3" />}
                  {mpStatus === "linked"    && <CheckCircle2 className="size-3" />}
                  {mpStatus === "archived"  && <Archive className="size-3" />}
                  {MP_STATUS_LABEL[mpStatus]}
                </span>
              </div>
              <h1 className="text-xl font-semibold text-foreground">{booking.property_address ?? "—"}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4" />{fmt(booking.date)}
                </span>
                {booking.time && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" />{booking.time.slice(0, 5)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {/* Scheduled → mark as Pending */}
              {mpStatus === "scheduled" && (
                <form action={async () => { "use server"; await setMatterportPending(booking.id) }}>
                  <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
                    <Loader2 className="size-4 text-amber-500" />
                    Mark as Pending
                  </button>
                </form>
              )}
              {/* Linked → archive */}
              {mpStatus === "linked" && (
                <form action={async () => { "use server"; await setMatterportArchived(booking.id) }}>
                  <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
                    <Archive className="size-4 text-zinc-400" />
                    Archive
                  </button>
                </form>
              )}
              {matterportLink && (
                <a
                  href={matterportLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-700 transition-colors"
                >
                  <ExternalLink className="size-4" />Open Tour
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">

          {/* LEFT: property + contact + subscription */}
          <div className="flex flex-col gap-5">

            {/* Property */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="px-5 py-3.5 bg-muted/40 border-b">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Property</p>
              </div>
              <div className="divide-y">
                {booking.property_type && (
                  <div className="flex items-center gap-3 px-5 py-3.5">
                    <Home className="size-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm font-medium capitalize">{booking.property_type}</p>
                    </div>
                  </div>
                )}
                {booking.rooms && (
                  <div className="flex items-center gap-3 px-5 py-3.5">
                    <Layers className="size-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Rooms</p>
                      <p className="text-sm font-medium">{booking.rooms}</p>
                    </div>
                  </div>
                )}
                {booking.square_meters && (
                  <div className="flex items-center gap-3 px-5 py-3.5">
                    <MapPin className="size-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Size</p>
                      <p className="text-sm font-medium">{booking.square_meters} m²</p>
                    </div>
                  </div>
                )}
                {booking.parking && (
                  <div className="flex items-center gap-3 px-5 py-3.5">
                    <ParkingCircle className="size-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Parking</p>
                      <p className="text-sm font-medium capitalize">{booking.parking}</p>
                    </div>
                  </div>
                )}
                {booking.furnished && (
                  <div className="flex items-center gap-3 px-5 py-3.5">
                    <Sofa className="size-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Furnished</p>
                      <p className="text-sm font-medium capitalize">{booking.furnished}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            {contact && (
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="px-5 py-3.5 bg-muted/40 border-b">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Contact</p>
                </div>
                <div className="p-5 flex items-center gap-3 border-b">
                  <div className="size-10 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">
                    {contact.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{contact.full_name}</p>
                    {contact.company && <p className="text-xs text-muted-foreground">{contact.company}</p>}
                  </div>
                </div>
                <div className="divide-y">
                  {contact.email && (
                    <div className="flex items-center gap-3 px-5 py-3">
                      <Mail className="size-4 text-muted-foreground shrink-0" />
                      <a href={`mailto:${contact.email}`} className="text-sm text-foreground hover:underline truncate">{contact.email}</a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-3 px-5 py-3">
                      <Phone className="size-4 text-muted-foreground shrink-0" />
                      <a href={`tel:${contact.phone}`} className="text-sm text-foreground hover:underline">{contact.phone}</a>
                    </div>
                  )}
                  <div className="px-5 py-3">
                    <Link href={`/panel/contacts/${contact.id}`} className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      View full contact →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription */}
            {sub && (() => {
              const days = daysLeft(sub.ends_at)
              const expired = days <= 0
              const expiring = !expired && days <= 30
              return (
                <div className="rounded-xl border bg-card p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Matterport Subscription</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Expires on</p>
                      <p className="text-sm font-semibold">{fmt(sub.ends_at)}</p>
                      <p className={`text-xs mt-0.5 font-medium tabular-nums ${expired ? "text-red-600" : expiring ? "text-amber-600" : "text-emerald-600"}`}>
                        {expired ? `${Math.abs(days)} days ago` : days === 0 ? "Expires today" : `${days} days left`}
                      </p>
                    </div>
                    {expired
                      ? <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-1 text-xs font-medium"><XCircle className="size-3" />Expired</span>
                      : expiring
                      ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 text-xs font-medium"><AlertTriangle className="size-3" />Expiring</span>
                      : <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 text-xs font-medium"><CheckCircle2 className="size-3" />Active</span>
                    }
                  </div>
                </div>
              )
            })()}

          </div>

          {/* RIGHT: Matterport 3D Tour embed */}
          <div className="lg:col-span-2 flex flex-col min-h-130">
            <div className="rounded-xl border bg-card overflow-hidden flex-1 flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div className="flex items-center gap-2">
                  <Box className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">Matterport 3D Tour</h2>
                </div>
                {matterportLink && (
                  <a
                    href={matterportLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="size-3.5" />Open full screen
                  </a>
                )}
              </div>
              {matterportLink ? (
                <>
                  <div className="aspect-video">
                    <iframe
                      src={matterportLink}
                      allow="vr; xr; accelerometer; magnetometer; gyroscope; autoplay"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                  {/* Replace link */}
                  <div className="px-5 py-4 border-t bg-muted/40">
                    <form action={saveMatterportLink} className="flex items-center gap-2">
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <Link2 className="size-4 text-muted-foreground shrink-0" />
                      <input
                        type="url"
                        name="link"
                        defaultValue={matterportLink ?? ""}
                        placeholder="https://my.matterport.com/show/?m=..."
                        className="flex-1 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-medium hover:opacity-80 transition-opacity shrink-0"
                      >
                        Update
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center gap-4 px-6">
                  <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
                    <Box className="size-8 text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {mpStatus === "scheduled" ? "Shoot not done yet" : "Waiting for Matterport link"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                      {mpStatus === "scheduled"
                        ? `Shoot scheduled for ${fmt(booking.date)}. Once completed, mark as Pending and paste the link.`
                        : "Paste the Matterport link below. The client will be notified by email automatically."}
                    </p>
                  </div>
                  {/* Add link form — only show when pending */}
                  {mpStatus === "pending" && (
                    <form action={saveMatterportLink} className="w-full max-w-sm flex flex-col gap-2">
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <input
                        type="url"
                        name="link"
                        required
                        placeholder="https://my.matterport.com/show/?m=..."
                        className="w-full rounded-lg border bg-background text-foreground placeholder:text-muted-foreground px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-foreground text-background px-4 py-2.5 text-sm font-semibold hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
                      >
                        <Link2 className="size-4" />
                        Save link &amp; notify client
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
