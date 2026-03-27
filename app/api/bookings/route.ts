import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { DbBooking } from "@/app/panel/bookings/BookingsClientPage"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // role is signed in the JWT app_metadata — read from header sent by the client (set via UserContext)
  // contactId is pre-resolved by UserContext (/api/me fetch on mount) and passed as header
  const role      = request.headers.get("x-user-role") ?? (user.app_metadata?.role as string | undefined) ?? "admin"
  const contactId = request.headers.get("x-contact-id")

  const admin = createAdminClient()

  // Build query — single DB round-trip
  let query = admin
    .from("bookings")
    .select(`
      id, date, time, service, property_address, status, contact_id,
      contacts(full_name, company)
    `)
    .order("date", { ascending: false })
    .order("time", { ascending: false })

  if (role === "user" && contactId) {
    query = query.eq("contact_id", contactId)
  }

  const { data: rows, error } = await query

  if (error) {
    console.error("[/api/bookings] DB error:", error.message)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }

  const bookings: DbBooking[] = (rows ?? []).map((r: Record<string, unknown>) => {
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

  console.log(`[/api/bookings] user: ${user.email} | role: ${role} | returned: ${bookings.length} bookings`)

  return NextResponse.json(bookings)
}
