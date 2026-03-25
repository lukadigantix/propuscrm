import { createAdminClient } from "@/lib/supabase/admin"
import BookingsClientPage, { type DbBooking } from "./BookingsClientPage"

export default async function BookingsPage() {
  const admin = createAdminClient()

  const { data: rows } = await admin
    .from("bookings")
    .select(`
      id, date, time, service, property_address, status, contact_id,
      contacts(full_name, company)
    `)
    .order("date", { ascending: false })
    .order("time", { ascending: false })

  const dbBookings: DbBooking[] = (rows ?? []).map((r: Record<string, unknown>) => {
    const contact = r.contacts as { full_name: string; company: string | null } | null
    return {
      id:               r.id as string,
      date:             r.date as string,
      time:             (r.time as string) ?? null,
      service:          r.service as string,
      property_address: (r.property_address as string) ?? null,
      status:           (r.status as string) ?? "Scheduled",
      contact_id:       (r.contact_id as string) ?? null,
      contact_name:     contact?.full_name ?? "Unknown",
      contact_company:  contact?.company ?? null,
    }
  })

  return <BookingsClientPage dbBookings={dbBookings} />
}

