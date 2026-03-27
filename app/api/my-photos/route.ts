import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { DbClientPhotoBooking, DbClientPhoto } from "@/app/panel/my-photos/page"

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: contact } = await admin
    .from("contacts")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (!contact) {
    return NextResponse.json([])
  }

  const { data: bookingRows, error: bookingError } = await admin
    .from("bookings")
    .select("id, date, time, property_address, status")
    .eq("contact_id", contact.id)
    .in("service", ["photos", "both"])
    .order("date", { ascending: false })

  if (bookingError) {
    console.error("[/api/my-photos] bookings error:", bookingError.message)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  if (!bookingRows?.length) {
    return NextResponse.json([])
  }

  const bookingIds = bookingRows.map((b) => b.id)

  const { data: photoRows, error: photoError } = await admin
    .from("photo_selections")
    .select("id, booking_id, photo_url, filename, selected, starred, client_note")
    .in("booking_id", bookingIds)
    .order("uploaded_at", { ascending: true })

  if (photoError) {
    console.error("[/api/my-photos] photos error:", photoError.message)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  const photosByBooking = new Map<string, DbClientPhoto[]>()
  for (const p of photoRows ?? []) {
    if (!photosByBooking.has(p.booking_id)) photosByBooking.set(p.booking_id, [])
    photosByBooking.get(p.booking_id)!.push({
      id:          p.id,
      photo_url:   p.photo_url,
      filename:    p.filename,
      selected:    p.selected,
      starred:     p.starred,
      client_note: p.client_note ?? null,
    })
  }

  const bookings: DbClientPhotoBooking[] = bookingRows.map((r) => ({
    id:               r.id,
    date:             r.date,
    time:             r.time ?? null,
    property_address: r.property_address ?? null,
    status:           r.status,
    photos:           photosByBooking.get(r.id) ?? [],
  }))

  console.log(`[/api/my-photos] user: ${user.email} | returned: ${bookings.length} bookings`)

  return NextResponse.json(bookings)
}
