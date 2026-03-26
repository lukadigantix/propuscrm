import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import BookingsClientPage, { type DbBooking } from "./BookingsClientPage"

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()

  // Determine role and optionally scope to the contact linked to this user
  let contactId: string | null = null
  let isClient = false
  if (user) {
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role === "user") {
      isClient = true
      // Find the contact row linked to this auth user
      const { data: contact } = await admin
        .from("contacts")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle()
      contactId = contact?.id ?? null
    }
  }

  // Build query — filter by contact if client role
  let query = admin
    .from("bookings")
    .select(`
      id, date, time, service, property_address, status, contact_id,
      contacts(full_name, company)
    `)
    .order("date", { ascending: false })
    .order("time", { ascending: false })

  if (contactId) {
    query = query.eq("contact_id", contactId)
  }

  const { data: rows } = await query

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

  return <BookingsClientPage dbBookings={dbBookings} isClient={isClient} />
}

