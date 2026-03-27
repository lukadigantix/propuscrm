import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()

  const [{ data: contact }, { data: bookings }, { data: subscriptions }] = await Promise.all([
    admin.from("contacts").select("id, full_name, email, phone, company, created_at").eq("id", id).single(),
    admin
      .from("bookings")
      .select("id, date, time, service, property_address, property_type, status, rooms, square_meters, assigned_team_member, created_at")
      .eq("contact_id", id)
      .order("date", { ascending: false }),
    admin
      .from("subscriptions")
      .select("id, service, status, starts_at, ends_at, is_free")
      .eq("contact_id", id)
      .order("created_at", { ascending: false }),
  ])

  if (!contact) {
    console.log(`[/api/contacts/${id}] not found for user: ${user.email}`)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  console.log(`[/api/contacts/${id}] fetched by user: ${user.email}`)
  return NextResponse.json({ contact, bookings: bookings ?? [], subscriptions: subscriptions ?? [] })
}
