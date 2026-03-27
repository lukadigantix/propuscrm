"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import MapView from "@/components/map-view"
import BackButton from "@/components/back-button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CalendarDays,
  Clock,
  MapPin,
  Camera,
  Box,
  Video,
  User,
  Home,
  Layers,
  Ruler,
  ParkingCircle,
  Sofa,
  StickyNote,
  ArrowRight,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type Contact = {
  full_name: string
  email: string | null
  phone: string | null
  company: string | null
}

type Booking = {
  id: string
  date: string
  time: string | null
  service: string
  status: string
  property_address: string | null
  property_type: string | null
  property_lat: number | null
  property_lon: number | null
  rooms: string | null
  square_meters: number | null
  parking: string | null
  furnished: string | null
  access_notes: string | null
  assigned_team_member: string | null
  created_at: string
  contact_id: string | null
  contacts: Contact | Contact[] | null
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  Scheduled:     "bg-amber-100 text-amber-800",
  "In Progress": "bg-purple-100 text-purple-800",
  Delivered:     "bg-green-100 text-green-800",
  Invoiced:      "bg-blue-100 text-blue-800",
  Cancelled:     "bg-red-100 text-red-800",
}

const SERVICE_ICON: Record<string, React.ReactNode> = {
  photos:     <Camera className="size-4" />,
  matterport: <Box className="size-4" />,
  both:       <><Camera className="size-4" /><Box className="size-4" /></>,
  Photos:     <Camera className="size-4" />,
  Matterport: <Box className="size-4" />,
  Video:      <Video className="size-4" />,
}

const SERVICE_LABEL: Record<string, string> = {
  photos:     "Photos",
  matterport: "Matterport",
  both:       "Photos + Matterport",
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-CH", { day: "numeric", month: "long", year: "numeric" })
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BookingDetailClient({ id }: { id: string }) {
  const { data: booking, isLoading: loading, isError, error } = useQuery<Booking>({
    queryKey: ["booking", id],
    queryFn: async () => {
      console.log(`[BookingDetailClient] fetching /api/bookings/${id}...`)
      const res = await fetch(`/api/bookings/${id}`)
      if (res.status === 404) throw Object.assign(new Error("Not found"), { status: 404 })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      console.log(`[BookingDetailClient] loaded booking: ${data.property_address ?? data.id}`)
      return data
    },
    retry: false, // don't retry 404s
  })

  const notFound = isError && (error as Error & { status?: number })?.status === 404

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!loading && notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
        <p className="text-lg font-medium">Booking not found</p>
        <p className="text-sm">The booking you&apos;re looking for doesn&apos;t exist or was deleted.</p>
        <BackButton label="Go back" />
      </div>
    )
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-20" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-7 w-72" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 space-y-3">
              <Skeleton className="h-4 w-20" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border bg-card px-8 py-7 space-y-3">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="hidden lg:block rounded-xl" style={{ height: "calc(100vh - 120px)" }} />
        </div>
      </div>
    )
  }

  if (!booking) return null

  const contact = (Array.isArray(booking.contacts) ? booking.contacts[0] : booking.contacts) as Contact | null
  const shortId = booking.id.slice(0, 8).toUpperCase()
  const hasMap = booking.property_lat != null && booking.property_lon != null

  // ── Main UI ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Back */}
      <BackButton label="Back" />

      <div className={`grid gap-6 ${hasMap ? "lg:grid-cols-2" : ""}`}>
        {/* Left column */}
        <div className="flex flex-col gap-6">

          {/* Header */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">{shortId}</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[booking.status] ?? "bg-muted text-zinc-700"}`}>
                    {booking.status}
                  </span>
                </div>
                <h1 className="text-xl font-semibold">{booking.property_address ?? "—"}</h1>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-muted-foreground">
                {SERVICE_ICON[booking.service]}
                <span>{SERVICE_LABEL[booking.service] ?? booking.service}</span>
              </div>
            </div>

            {/* Date + Time */}
            <div className="mt-4 flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {fmt(booking.date)}
              </span>
              {booking.time && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" />
                  {booking.time.slice(0, 5)}
                </span>
              )}
              {booking.assigned_team_member && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="size-4" />
                  <span className="font-semibold text-foreground">{booking.assigned_team_member}</span>
                </span>
              )}
            </div>
          </div>

          {/* Property details */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-sm font-medium mb-4">Property</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {booking.property_address && (
                <div className="flex items-start gap-2">
                  <MapPin className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm font-medium">{booking.property_address}</p>
                  </div>
                </div>
              )}
              {booking.property_type && (
                <div className="flex items-start gap-2">
                  <Home className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm font-medium">{booking.property_type}</p>
                  </div>
                </div>
              )}
              {booking.rooms && (
                <div className="flex items-start gap-2">
                  <Layers className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Rooms</p>
                    <p className="text-sm font-medium">{booking.rooms}</p>
                  </div>
                </div>
              )}
              {booking.square_meters && (
                <div className="flex items-start gap-2">
                  <Ruler className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Size</p>
                    <p className="text-sm font-medium">{booking.square_meters} m²</p>
                  </div>
                </div>
              )}
              {booking.parking && (
                <div className="flex items-start gap-2">
                  <ParkingCircle className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Parking</p>
                    <p className="text-sm font-medium">{booking.parking}</p>
                  </div>
                </div>
              )}
              {booking.furnished != null && (
                <div className="flex items-start gap-2">
                  <Sofa className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Furnished</p>
                    <p className="text-sm font-medium">{booking.furnished}</p>
                  </div>
                </div>
              )}
            </div>
            {booking.access_notes && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2.5">
                <StickyNote className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Access notes</p>
                  <p className="text-sm">{booking.access_notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Contact */}
          {contact && (
            <div className="rounded-xl border bg-card px-8 py-7">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Contact</p>
                  <p className="text-lg font-semibold">{contact.full_name}</p>
                  {contact.company && (
                    <p className="text-sm text-muted-foreground mt-0.5">{contact.company}</p>
                  )}
                  <div className="mt-3 flex flex-col gap-1">
                    {contact.email && <p className="text-sm text-muted-foreground">{contact.email}</p>}
                    {contact.phone && <p className="text-sm text-muted-foreground">{contact.phone}</p>}
                  </div>
                </div>
                {booking.contact_id && (
                  <Link
                    href={`/panel/contacts/${booking.contact_id}`}
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 h-8 text-sm font-medium hover:bg-muted transition-colors shrink-0"
                  >
                    View contact
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Deliverables */}
          {(booking.service === "photos" || booking.service === "matterport" || booking.service === "both") && (
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-sm font-medium mb-4">Deliverables</h2>
              <div className="flex flex-col gap-3">
                {(booking.service === "photos" || booking.service === "both") && (
                  <Link
                    href={`/panel/photos/${booking.id}`}
                    className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3 hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-violet-500/10 text-violet-500">
                        <Camera className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Photo Job</p>
                        <p className="text-xs text-muted-foreground">View gallery and delivery status</p>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </Link>
                )}
                {(booking.service === "matterport" || booking.service === "both") && (
                  <Link
                    href={`/panel/matterport/tours/${booking.id}`}
                    className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3 hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
                        <Box className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Matterport Tour</p>
                        <p className="text-xs text-muted-foreground">View 3D tour and link status</p>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </Link>
                )}
              </div>
            </div>
          )}

        </div>{/* end left column */}

        {/* Right column — map */}
        {hasMap && (
          <div className="rounded-xl border bg-card overflow-hidden sticky top-6" style={{ height: "calc(100vh - 120px)" }}>
            <div className="h-full">
              <MapView lat={booking.property_lat as number} lon={booking.property_lon as number} />
            </div>
          </div>
        )}
      </div>{/* end grid */}
    </div>
  )
}
