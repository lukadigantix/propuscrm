import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: booking, error } = await admin
    .from("bookings")
    .select(`
      id, date, time, service, status,
      property_address, property_type, property_lat, property_lon,
      rooms, square_meters, parking, furnished, access_notes,
      assigned_team_member, created_at,
      contact_id,
      contacts(full_name, email, phone, company)
    `)
    .eq("id", id)
    .single()

  if (error || !booking) {
    console.log(`[/api/bookings/${id}] not found or error:`, error?.message)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  console.log(`[/api/bookings/${id}] fetched by user: ${user.email}`)
  return NextResponse.json(booking)
}
