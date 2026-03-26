import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import MyPhotosClientView from "./MyPhotosClientView"

export type DbClientPhoto = {
  id: string
  photo_url: string
  filename: string
  selected: boolean
  starred: boolean
  client_note: string | null
}

export type DbClientPhotoBooking = {
  id: string
  date: string
  time: string | null
  property_address: string | null
  status: string
  photos: DbClientPhoto[]
}

export default async function MyPhotosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const admin = createAdminClient()

  const { data: contact } = await admin
    .from("contacts")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (!contact) return <MyPhotosClientView bookings={[]} />

  const { data: bookingRows } = await admin
    .from("bookings")
    .select("id, date, time, property_address, status")
    .eq("contact_id", contact.id)
    .in("service", ["photos", "both"])
    .order("date", { ascending: false })

  if (!bookingRows?.length) return <MyPhotosClientView bookings={[]} />

  const bookingIds = bookingRows.map((b) => b.id)

  const { data: photoRows } = await admin
    .from("photo_selections")
    .select("id, booking_id, photo_url, filename, selected, starred, client_note")
    .in("booking_id", bookingIds)
    .order("uploaded_at", { ascending: true })

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

  return <MyPhotosClientView bookings={bookings} />
}
