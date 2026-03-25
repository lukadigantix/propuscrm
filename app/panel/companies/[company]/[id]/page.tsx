import Link from "next/link"
import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { slugify } from "@/lib/utils"
import { CONTACTS } from "@/lib/data/contacts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import BackButton from "@/components/back-button"
import {
  Mail,
  Phone,
  Building2,
  CalendarDays,
  Camera,
  Box,
  FileText,
  Pencil,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCcw,
} from "lucide-react"

function daysLeft(ends_at: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.round((new Date(ends_at).getTime() - today.getTime()) / 86_400_000)
}
function fmt(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-CH", { day: "numeric", month: "short", year: "numeric" })
}
function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

const STATUS_COLOR: Record<string, string> = {
  Delivered:     "bg-green-100 text-green-800",
  Invoiced:      "bg-blue-100 text-blue-800",
  Scheduled:     "bg-amber-100 text-amber-800",
  "In Progress": "bg-purple-100 text-purple-800",
  Cancelled:     "bg-red-100 text-red-800",
}

const SERVICE_ICON: Record<string, React.ReactNode> = {
  photos:     <Camera className="size-3" />,
  matterport: <Box className="size-3" />,
  both:       <><Camera className="size-3" /><Box className="size-3" /></>,
}
const SERVICE_LABEL: Record<string, string> = {
  photos:     "Photos",
  matterport: "Matterport",
  both:       "Photos + Matterport",
}

export default async function CompanyContactDetailPage({
  params,
}: {
  params: Promise<{ company: string; id: string }>
}) {
  const { company: slug, id } = await params
  const backUrl = `/panel/companies/${slug}`

  // Sample contacts have numeric IDs; DB contacts have UUIDs
  const isSample = /^\d+$/.test(id)

  if (isSample) {
    // Resolve display name from sample data
    const sampleContact = CONTACTS.find((c) => c.id === Number(id))
    const backLabel = sampleContact?.company ?? slug
    return <SampleContactPage id={Number(id)} backUrl={backUrl} backLabel={backLabel} />
  }

  const admin = createAdminClient()

  const [{ data: contact }, { data: bookings }, { data: subscriptions }] = await Promise.all([
    admin.from("contacts").select("id, full_name, email, phone, company, created_at").eq("id", id).single(),
    admin.from("bookings")
      .select("id, date, time, service, property_address, property_type, status, rooms, square_meters, assigned_team_member, created_at")
      .eq("contact_id", id)
      .order("date", { ascending: false }),
    admin.from("subscriptions")
      .select("id, service, status, starts_at, ends_at, is_free")
      .eq("contact_id", id)
      .order("created_at", { ascending: false }),
  ])

  if (!contact) notFound()

  const matterportSub = subscriptions?.find((s) => s.service === "matterport" && (s.status === "active" || s.status === "expiring")) ?? null
  const lastBookingDate = bookings?.[0]?.date ?? null
  const sub = matterportSub
  const days = sub ? daysLeft(sub.ends_at) : 0
  const isExpired  = sub ? (sub.status === "expired" || sub.status === "cancelled" || days <= 0) : false
  const isExpiring = sub ? (!isExpired && days <= 30) : false

  return (
    <div className="flex flex-col gap-6 p-6">
      <BackButton label="Back" />

      {/* Header card */}
      <div className="rounded-xl border bg-card p-6 flex items-start gap-5">
        <Avatar className="size-16 shrink-0">
          <AvatarFallback className="text-xl font-semibold">
            {initials(contact.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold">{contact.full_name}</h1>
          {contact.company && (
            <p className="text-sm text-muted-foreground mt-0.5">{contact.company}</p>
          )}
        </div>
        <Button variant="outline" size="sm" className="shrink-0">
          <Pencil className="size-3.5 mr-1.5" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left column */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="rounded-xl border bg-card p-5">
            <h2 className="text-sm font-medium mb-4">Contact Info</h2>
            <div className="flex flex-col gap-3 text-sm">
              {contact.email && (
                <div className="flex items-start gap-3">
                  <Mail className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <a href={`mailto:${contact.email}`} className="break-all hover:underline">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="size-4 text-muted-foreground shrink-0" />
                  <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center gap-3">
                  <Building2 className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{contact.company}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h2 className="text-sm font-medium mb-4">Activity</h2>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" /> Total bookings
                </span>
                <span className="font-semibold">{bookings?.length ?? 0}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last booking</span>
                <span>{lastBookingDate ? fmt(lastBookingDate) : "—"}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Client since</span>
                <span>{fmt(contact.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium">Subscription</h2>
              {sub && (
                <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs">
                  <RefreshCcw className="size-3 mr-1" /> Renew
                </Button>
              )}
            </div>
            {!sub ? (
              <p className="text-sm text-muted-foreground">No active subscription.</p>
            ) : (
              <>
                <div className="mb-4">
                  {isExpired ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                      <XCircle className="size-3.5" />Expired
                    </span>
                  ) : isExpiring ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                      <AlertTriangle className="size-3.5" />
                      {days <= 0 ? "Expires today" : `Expires in ${days} days`}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                      <CheckCircle2 className="size-3.5" />Active — {days} days left
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service</span>
                    <span className="capitalize">{sub.service}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Started</span>
                    <span>{fmt(sub.starts_at)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{isExpired ? "Expired on" : "Expires on"}</span>
                    <span className={isExpired ? "text-red-600 font-medium" : isExpiring ? "text-amber-700 font-medium" : ""}>{fmt(sub.ends_at)}</span>
                  </div>
                  {sub.is_free && (
                    <>
                      <Separator />
                      <p className="text-xs text-muted-foreground">Free subscription (first Matterport booking)</p>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-2">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-sm font-medium">Booking History</h2>
              <Link
                href="/booking"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <CalendarDays className="size-3.5" />
                New Booking
              </Link>
            </div>

            {!bookings || bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <CalendarDays className="size-7 opacity-30" />
                <p className="text-sm">No bookings yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {bookings.slice(0, 10).map((b) => (
                  <div key={b.id} className="px-5 py-4 hover:bg-muted/40 transition-colors cursor-pointer">
                    <div className="flex items-stretch justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">{b.id.slice(0, 8).toUpperCase()}</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[b.status] ?? "bg-muted text-zinc-700"}`}>
                            {b.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium mt-1 truncate">{b.property_address ?? "—"}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
                            {SERVICE_ICON[b.service]}
                            {SERVICE_LABEL[b.service] ?? b.service}
                          </span>
                          {b.assigned_team_member && (
                            <span className="text-xs text-muted-foreground">· <span className="font-semibold text-foreground">{b.assigned_team_member}</span></span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between shrink-0">
                        <div>
                          {(b.rooms || b.square_meters) && (
                            <div className="flex items-center gap-1">
                              {b.rooms && (
                                <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{b.rooms} rooms</span>
                              )}
                              {b.square_meters && (
                                <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{b.square_meters} m²</span>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{fmt(b.date)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {bookings && bookings.length > 10 && (
              <div className="px-5 py-3 border-t">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground w-full">
                  <FileText className="size-3.5 mr-1.5" />
                  View all {bookings.length} bookings
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sample contact page (numeric ID) ────────────────────────────────────────

const BOOKING_HISTORY: Record<number, { id: string; date: string; property: string; services: string[]; status: string; amount: string }[]> = {
  1: [
    { id: "BK-0241", date: "14 Mar 2026", property: "Seestrasse 112, 8002 Zürich",      services: ["Photos", "Matterport"], status: "Delivered",   amount: "CHF 680" },
    { id: "BK-0229", date: "28 Feb 2026", property: "Schiffbaustrasse 14, 8005 Zürich", services: ["Photos"],                status: "Delivered",   amount: "CHF 320" },
    { id: "BK-0218", date: "10 Feb 2026", property: "Rämistrasse 5, 8001 Zürich",       services: ["Photos", "Matterport"], status: "Invoiced",    amount: "CHF 680" },
  ],
  4: [
    { id: "BK-0244", date: "18 Mar 2026", property: "Seestrasse 78, 8700 Küsnacht",     services: ["Photos", "Matterport"], status: "Scheduled",   amount: "CHF 680" },
    { id: "BK-0240", date: "12 Mar 2026", property: "Forchstrasse 30, 8032 Zürich",     services: ["Photos"],               status: "Delivered",   amount: "CHF 320" },
  ],
  10: [
    { id: "BK-0243", date: "17 Mar 2026", property: "Talstrasse 62, 8001 Zürich",       services: ["Photos", "Matterport"], status: "In Progress", amount: "CHF 680" },
    { id: "BK-0235", date: "4 Mar 2026",  property: "Räffelstrasse 24, 8045 Zürich",    services: ["Matterport"],            status: "Delivered",   amount: "CHF 380" },
  ],
}

const SAMPLE_SERVICE_ICON: Record<string, React.ReactNode> = {
  Photos:     <Camera className="size-3" />,
  Matterport: <Box className="size-3" />,
}

function SampleContactPage({
  id,
  backUrl,
  backLabel,
}: {
  id: number
  backUrl: string
  backLabel: string
}) {
  const contact = CONTACTS.find((c) => c.id === id)
  if (!contact) return notFound()

  const history    = BOOKING_HISTORY[contact.id] ?? []
  const sub        = contact.subscription
  const days       = daysLeft(sub.ends_at)
  const isExpired  = sub.status === "expired" || sub.status === "cancelled"
  const isExpiring = !isExpired && days <= 30

  return (
    <div className="flex flex-col gap-6 p-6">
      <BackButton label="Back" />

      {/* Header */}
      <div className="rounded-xl border bg-card p-6 flex items-start gap-5">
        <Avatar className="size-16 shrink-0">
          <AvatarFallback className="text-xl font-semibold">{initials(contact.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold">{contact.name}</h1>
            {contact.status === "Inactive" && (
              <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>
            )}
          </div>
          {contact.role
            ? <p className="text-sm text-muted-foreground mt-0.5">{contact.role} · {contact.company}</p>
            : <p className="text-sm text-muted-foreground mt-0.5">{contact.company}</p>
          }
        </div>
        <Button variant="outline" size="sm" className="shrink-0">
          <Pencil className="size-3.5 mr-1.5" />Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1 flex flex-col gap-4">
          {/* Contact Info */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="text-sm font-medium mb-4">Contact Info</h2>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <a href={`mailto:${contact.email}`} className="break-all hover:underline">{contact.email}</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-4 text-muted-foreground shrink-0" />
                <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
              </div>
              {contact.address && (
                <div className="flex items-start gap-3">
                  <Building2 className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{contact.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="text-sm font-medium mb-4">Activity</h2>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><CalendarDays className="size-3.5" /> Total bookings</span>
                <span className="font-semibold">{contact.bookings}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last booking</span>
                <span>{contact.lastBooking}</span>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium">Subscription</h2>
              <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs">
                <RefreshCcw className="size-3 mr-1" /> Renew
              </Button>
            </div>
            <div className="mb-4">
              {isExpired ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                  <XCircle className="size-3.5" />Expired
                </span>
              ) : isExpiring ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                  <AlertTriangle className="size-3.5" />
                  {days <= 0 ? "Expires today" : `Expires in ${days} days`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                  <CheckCircle2 className="size-3.5" />Active — {days} days left
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Started</span>
                <span>{fmt(sub.starts_at)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{isExpired ? "Expired on" : "Expires on"}</span>
                <span className={isExpired ? "text-red-600 font-medium" : isExpiring ? "text-amber-700 font-medium" : ""}>{fmt(sub.ends_at)}</span>
              </div>
              {sub.late_renewal_fee_applied && (
                <>
                  <Separator />
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700">
                    <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
                    <span>15% late renewal fee applies on next renewal.</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {contact.notes && (
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-sm font-medium mb-3">Notes</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{contact.notes}</p>
            </div>
          )}
        </div>

        {/* Booking History */}
        <div className="md:col-span-2">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-sm font-medium">Booking History</h2>
              <Link
                href="/booking"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <CalendarDays className="size-3.5" />
                New Booking
              </Link>
            </div>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <CalendarDays className="size-7 opacity-30" />
                <p className="text-sm">No bookings yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {history.map((b) => (
                  <div key={b.id} className="px-5 py-4 hover:bg-muted/40 transition-colors cursor-pointer">
                    <div className="flex items-stretch justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">{b.id}</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[b.status] ?? "bg-muted text-zinc-700"}`}>
                            {b.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium mt-1 truncate">{b.property}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {b.services.map((s) => (
                            <span key={s} className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
                              {SAMPLE_SERVICE_ICON[s]}{s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">{b.amount}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{b.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {history.length > 0 && (
              <div className="px-5 py-3 border-t">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground w-full">
                  <FileText className="size-3.5 mr-1.5" />
                  View all {contact.bookings} bookings
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
