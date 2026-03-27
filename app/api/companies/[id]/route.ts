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

  const [{ data: company }, { data: members }] = await Promise.all([
    admin.from("companies").select("*").eq("id", id).single(),
    admin.from("contacts").select("id, full_name, email, phone").eq("company_id", id),
  ])

  if (!company || !members || members.length === 0) {
    console.log(`[/api/companies/${id}] not found for user: ${user.email}`)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const memberIds = members.map((m) => m.id)

  const [{ data: bookingRows }, { data: subsRows }] = await Promise.all([
    admin.from("bookings").select("contact_id, date").in("contact_id", memberIds).order("date", { ascending: false }),
    admin.from("subscriptions").select("contact_id, status, ends_at").in("contact_id", memberIds).order("ends_at", { ascending: false }),
  ])

  const bookings: Record<string, { count: number; lastDate: string | null }> = {}
  for (const b of bookingRows ?? []) {
    if (!bookings[b.contact_id]) {
      bookings[b.contact_id] = { count: 1, lastDate: b.date }
    } else {
      bookings[b.contact_id].count++
    }
  }

  const subs: Record<string, { status: string; ends_at: string }> = {}
  for (const s of subsRows ?? []) {
    if (!subs[s.contact_id] && (s.status === "active" || s.status === "expiring")) {
      subs[s.contact_id] = { status: s.status, ends_at: s.ends_at }
    }
  }

  const totalBookings = Object.values(bookings).reduce((sum, v) => sum + v.count, 0)

  console.log(`[/api/companies/${id}] fetched by user: ${user.email}`)
  return NextResponse.json({
    company: {
      id: company.id,
      name: company.name,
      description: company.description ?? null,
      phone: company.phone ?? null,
      email: company.email ?? null,
      website: company.website ?? null,
      domains: company.domains ?? [],
      locations: company.locations ?? [],
    },
    members,
    bookings,
    subs,
    totalBookings,
  })
}
