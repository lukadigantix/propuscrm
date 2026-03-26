import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, selected, starred, client_note } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const admin = createAdminClient()

  // Verify this photo belongs to a booking of this user's contact
  const { data: contact } = await admin
    .from("contacts")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data: photo } = await admin
    .from("photo_selections")
    .select("id, booking_id")
    .eq("id", id)
    .maybeSingle()

  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data: booking } = await admin
    .from("bookings")
    .select("id")
    .eq("id", photo.booking_id)
    .eq("contact_id", contact.id)
    .maybeSingle()

  if (!booking) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const patch: Record<string, unknown> = {}
  if (selected !== undefined) patch.selected = selected
  if (starred  !== undefined) patch.starred  = starred
  if (client_note !== undefined) patch.client_note = client_note

  const { error } = await admin
    .from("photo_selections")
    .update(patch)
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
