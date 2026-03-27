import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { DbMatterportBooking, DbMatterportTour, MatterportStatus } from "@/app/panel/matterport/MatterportClientPage"

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()

  const [{ data: bookingRows }, { data: tourRows }] = await Promise.all([
    admin
      .from("bookings")
      .select(
        "id, date, time, service, property_address, property_type, rooms, status, matterport_status, matterport_link, contact_id, contacts(full_name, company)"
      )
      .in("service", ["matterport", "both"])
      .order("date", { ascending: false }),

    admin
      .from("subscriptions")
      .select("id, contact_id, status, ends_at, contacts(full_name, company)")
      .eq("service", "matterport")
      .order("ends_at", { ascending: true }),
  ])

  const bookings: DbMatterportBooking[] = (bookingRows ?? []).map((row) => {
    const contact = Array.isArray(row.contacts) ? row.contacts[0] : row.contacts
    return {
      id: row.id,
      date: row.date,
      time: row.time ?? null,
      service: row.service,
      property_address: row.property_address ?? null,
      property_type: row.property_type ?? null,
      rooms: row.rooms ?? null,
      status: row.status,
      matterport_status: ((row as Record<string, unknown>).matterport_status as string ?? "scheduled") as MatterportStatus,
      matterport_link: (row as Record<string, unknown>).matterport_link as string ?? null,
      contact_name: contact?.full_name ?? "Unknown",
      contact_company: contact?.company ?? null,
      contact_id: row.contact_id ?? null,
    }
  })

  const tours: DbMatterportTour[] = (tourRows ?? []).map((row) => {
    const contact = Array.isArray(row.contacts) ? row.contacts[0] : row.contacts
    return {
      id: row.id,
      contact_id: row.contact_id,
      contact_name: contact?.full_name ?? "Unknown",
      contact_company: contact?.company ?? null,
      sub_ends_at: row.ends_at,
      sub_status: row.status,
    }
  })

  console.log(`[/api/matterport] user: ${user.email} | bookings: ${bookings.length}, tours: ${tours.length}`)

  return NextResponse.json({ bookings, tours })
}
