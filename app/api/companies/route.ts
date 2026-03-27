import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { EnrichedCompany } from "@/app/panel/companies/CompaniesClientPage"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()

  const [{ data: companies }, { data: contacts }, { data: bookingRows }] = await Promise.all([
    admin.from("companies").select("id, name, description, phone, email, website, domains, locations").order("name"),
    admin.from("contacts").select("id, company_id, full_name"),
    admin.from("bookings").select("contact_id"),
  ])

  const bookingsPerContact = new Map<string, number>()
  for (const b of bookingRows ?? []) {
    bookingsPerContact.set(b.contact_id, (bookingsPerContact.get(b.contact_id) ?? 0) + 1)
  }

  const enriched: EnrichedCompany[] = (companies ?? []).map((c) => {
    const members = (contacts ?? [])
      .filter((ct) => ct.company_id === c.id)
      .map((ct) => ({ id: ct.id, name: ct.full_name }))
    const totalBookings = members.reduce((sum, m) => sum + (bookingsPerContact.get(m.id) ?? 0), 0)
    return {
      id: c.id,
      name: c.name,
      description: c.description ?? null,
      phone: c.phone ?? null,
      email: c.email ?? null,
      website: c.website ?? null,
      domains: c.domains ?? [],
      locations: c.locations ?? [],
      members,
      totalBookings,
    }
  })

  console.log(`[/api/companies] user: ${user.email} | returned: ${enriched.length} companies`)
  return NextResponse.json(enriched)
}
