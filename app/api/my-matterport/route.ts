import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { DbClientMatterport } from "@/app/panel/my-matterport/page"

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

  const { data: rows, error } = await admin
    .from("bookings")
    .select("id, date, time, property_address, status, matterport_link")
    .eq("contact_id", contact.id)
    .in("service", ["matterport", "both"])
    .order("date", { ascending: false })

  if (error) {
    console.error("[/api/my-matterport] DB error:", error.message)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  const bookings: DbClientMatterport[] = (rows ?? []).map((r) => ({
    id: r.id,
    date: r.date,
    time: r.time ?? null,
    property_address: r.property_address ?? null,
    status: r.status,
    matterport_link: r.matterport_link ?? null,
  }))

  console.log(`[/api/my-matterport] user: ${user.email} | returned: ${bookings.length} bookings`)

  return NextResponse.json(bookings)
}
