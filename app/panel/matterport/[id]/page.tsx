import { notFound } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import BackButton from "@/components/back-button"
import { MATTERPORT_BOOKINGS } from "@/lib/data/matterport"
import { MapPin, User, Building2, CalendarDays, Link2 } from "lucide-react"

export default async function MatterportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const booking = MATTERPORT_BOOKINGS.find((b) => b.id === Number(id))

  if (!booking) notFound()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card px-6 py-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <BackButton label="Back" />
        <h1 className="text-lg font-semibold text-foreground truncate">{booking.property_address}</h1>
      </header>

      <div className="p-6 space-y-4 max-w-xl">
        <div className="overflow-hidden rounded-xl border bg-card divide-y">
          <Row icon={<MapPin className="size-4 text-muted-foreground" />} label="Property" value={booking.property_address} />
          <Row icon={<User className="size-4 text-muted-foreground" />} label="Contact" value={booking.contact_name} />
          <Row icon={<Building2 className="size-4 text-muted-foreground" />} label="Company" value={booking.contact_company} />
          <Row
            icon={<CalendarDays className="size-4 text-muted-foreground" />}
            label="Date"
            value={new Date(booking.date).toLocaleDateString("en-CH", { day: "numeric", month: "long", year: "numeric" })}
          />
          <div className="flex items-start gap-4 px-5 py-4">
            <span className="mt-0.5"><Link2 className="size-4 text-muted-foreground" /></span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Matterport Link</p>
              {booking.matterport_link ? (
                <a
                  href={booking.matterport_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {booking.matterport_link}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not linked yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-4 px-5 py-4">
      <span className="mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  )
}
