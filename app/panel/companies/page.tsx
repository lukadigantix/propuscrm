import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { HeaderActionButton } from "@/components/header-action-button"
import { Building2, Users, ChevronRight, CalendarDays } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import { slugify } from "@/lib/utils"

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default async function CompaniesPage() {
  const admin = createAdminClient()

  const [{ data: contacts }, { data: bookingRows }] = await Promise.all([
    admin
      .from("contacts")
      .select("id, full_name, company")
      .not("company", "is", null)
      .neq("company", ""),
    admin.from("bookings").select("contact_id"),
  ])

  // Count bookings per contact
  const bookingsPerContact = new Map<string, number>()
  for (const b of bookingRows ?? []) {
    bookingsPerContact.set(b.contact_id, (bookingsPerContact.get(b.contact_id) ?? 0) + 1)
  }

  // Group contacts by company
  type Group = {
    name: string
    members: { id: string; name: string }[]
    totalBookings: number
  }
  const map = new Map<string, Group>()
  for (const c of contacts ?? []) {
    if (!c.company) continue
    if (!map.has(c.company)) {
      map.set(c.company, { name: c.company, members: [], totalBookings: 0 })
    }
    const group = map.get(c.company)!
    group.members.push({ id: c.id, name: c.full_name })
    group.totalBookings += bookingsPerContact.get(c.id) ?? 0
  }

  const companies = Array.from(map.values()).sort((a, b) => b.totalBookings - a.totalBookings)
  const totalContacts = companies.reduce((s, c) => s + c.members.length, 0)
  const totalBookings = companies.reduce((s, c) => s + c.totalBookings, 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <h1 className="text-lg font-semibold text-foreground">Companies</h1>
        </div>
        <HeaderActionButton label="Add Company" />
      </header>

      <div className="p-6 flex flex-col gap-6">
        {/* Summary bar */}
        <div className="flex items-center gap-4">
          <div className="rounded-xl border bg-card px-5 py-3 flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Building2 className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{companies.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Companies</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card px-5 py-3 flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Users className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{totalContacts}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Contacts</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card px-5 py-3 flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <CalendarDays className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{totalBookings}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total bookings</p>
            </div>
          </div>
        </div>

        {/* Card grid */}
        {companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Building2 className="size-10 mb-3 opacity-20" />
            <p className="text-sm">No companies found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {companies.map((company) => (
              <Link
                key={company.name}
                href={`/panel/companies/${slugify(company.name)}`}
                className="group rounded-xl border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Top section */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <div className="size-12 rounded-xl bg-muted flex items-center justify-center text-base font-bold text-zinc-700">
                    {initials(company.name)}
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground group-hover:text-zinc-700 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* Body */}
                <div className="flex flex-col gap-3 px-5 pb-4 flex-1">
                  <div>
                    <h3 className="font-semibold text-sm leading-snug">{company.name}</h3>
                  </div>

                  {/* Avatar stack */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {company.members.slice(0, 4).map((m) => (
                        <div
                          key={m.id}
                          className="size-7 rounded-full bg-muted border-2 border-white flex items-center justify-center text-[10px] font-semibold text-muted-foreground"
                          title={m.name}
                        >
                          {initials(m.name)}
                        </div>
                      ))}
                      {company.members.length > 4 && (
                        <div className="size-7 rounded-full bg-muted border-2 border-white flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                          +{company.members.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {company.members.length} member{company.members.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Footer stats */}
                  <div className="mt-auto pt-3 border-t flex items-center text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3" />
                      {company.totalBookings} bookings
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
