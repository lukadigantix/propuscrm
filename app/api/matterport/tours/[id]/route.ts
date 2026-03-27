import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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

  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const rawContact = Array.isArray(booking.contacts) ? booking.contacts[0] : booking.contacts
  const contact = rawContact
    ? {
        id: (rawContact as Record<string, unknown>).id as string,
        full_name: (rawContact as Record<string, unknown>).full_name as string,
        email: ((rawContact as Record<string, unknown>).email as string) ?? null,
        phone: ((rawContact as Record<string, unknown>).phone as string) ?? null,
        company: ((rawContact as Record<string, unknown>).company as string) ?? null,
      }
    : null

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

  const row = booking as Record<string, unknown>

  console.log(`[/api/matterport/tours/${id}] user: ${user.email}`)

  return NextResponse.json({
    booking: {
      id: booking.id,
      date: booking.date,
      time: booking.time ?? null,
      service: booking.service,
      status: booking.status,
      property_address: booking.property_address ?? null,
      property_type: booking.property_type ?? null,
      rooms: booking.rooms ?? null,
      square_meters: (row.square_meters as number) ?? null,
      parking: (row.parking as string) ?? null,
      furnished: (row.furnished as string) ?? null,
      access_notes: (row.access_notes as string) ?? null,
      created_at: booking.created_at,
      contact_id: booking.contact_id ?? null,
      matterport_link: (row.matterport_link as string) ?? null,
      matterport_status: ((row.matterport_status as string) ?? "scheduled"),
      contact,
    },
    sub,
  })
}
