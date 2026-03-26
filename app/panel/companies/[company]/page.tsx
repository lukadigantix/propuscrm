import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft, Mail, Phone, AlertTriangle, CheckCircle2, XCircle,
  CalendarDays, Users, Globe, MapPin, ExternalLink,
} from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import { EditCompanySheet } from "./EditCompanySheet"

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

function daysLeft(ends_at: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.round((new Date(ends_at).getTime() - today.getTime()) / 86_400_000)
}

function SubBadge({ ends_at, status }: { ends_at: string; status: string }) {
  if (status === "expired" || status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
        <XCircle className="size-3" />Expired
      </span>
    )
  }
  const days = daysLeft(ends_at)
  if (days <= 30) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        <AlertTriangle className="size-3" />{days}d left
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
      <CheckCircle2 className="size-3" />{days}d left
    </span>
  )
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ company: string }> }) {
  const { company: id } = await params
  const admin = createAdminClient()

  const [{ data: company }, { data: members }] = await Promise.all([
    admin.from("companies").select("*").eq("id", id).single(),
    admin.from("contacts").select("id, full_name, email, phone").eq("company_id", id),
  ])

  if (!company) notFound()
  if (!members || members.length === 0) notFound()

  const memberIds = members.map((m) => m.id)

  const [{ data: bookingRows }, { data: subsRows }] = await Promise.all([
    admin.from("bookings").select("contact_id, date").in("contact_id", memberIds).order("date", { ascending: false }),
    admin.from("subscriptions").select("contact_id, status, ends_at").in("contact_id", memberIds).order("ends_at", { ascending: false }),
  ])

  const bookingsPerContact = new Map<string, { count: number; lastDate: string | null }>()
  for (const b of bookingRows ?? []) {
    const existing = bookingsPerContact.get(b.contact_id)
    if (!existing) {
      bookingsPerContact.set(b.contact_id, { count: 1, lastDate: b.date })
    } else {
      existing.count++
    }
  }

  const subPerContact = new Map<string, { status: string; ends_at: string }>()
  for (const s of subsRows ?? []) {
    if (!subPerContact.has(s.contact_id) && (s.status === "active" || s.status === "expiring")) {
      subPerContact.set(s.contact_id, { status: s.status, ends_at: s.ends_at })
    }
  }

  const totalBookings = [...bookingsPerContact.values()].reduce((sum, v) => sum + v.count, 0)
  const domains: string[] = company.domains ?? []
  const locations: string[] = company.locations ?? []

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-card px-6 py-4">
        <Link href="/panel/companies" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          Companies
        </Link>
        <EditCompanySheet company={{
          id: company.id,
          name: company.name,
          description: company.description ?? null,
          phone: company.phone ?? null,
          email: company.email ?? null,
          website: company.website ?? null,
          domains: company.domains ?? [],
          locations: company.locations ?? [],
        }} />
      </header>

      <div className="p-6 flex flex-col gap-6">
        {/* Company card */}
        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Header */}
          <div className="px-6 py-6 flex items-start gap-5 border-b">
            <div className="size-16 rounded-xl bg-muted flex items-center justify-center text-xl font-bold text-foreground shrink-0">
              {initials(company.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold">{company.name}</h1>
              {company.description && (
                <p className="text-sm text-muted-foreground mt-1">{company.description}</p>
              )}
            </div>
          </div>

          {/* Details grid */}
          {(company.email || company.phone || company.website || locations.length > 0 || domains.length > 0) && (
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 border-b">
              {company.email && (
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Email</p>
                    <p className="text-sm">{company.email}</p>
                  </div>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Phone</p>
                    <p className="text-sm">{company.phone}</p>
                  </div>
                </div>
              )}
              {company.website && (
                <div className="flex items-center gap-3">
                  <ExternalLink className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Website</p>
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline truncate block">
                      {company.website}
                    </a>
                  </div>
                </div>
              )}
              {locations.length > 0 && (
                <div className="flex items-start gap-3">
                  <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Locations</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {locations.map((l) => (
                        <span key={l} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">{l}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {domains.length > 0 && (
                <div className="flex items-start gap-3">
                  <Globe className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Domains</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {domains.map((d) => (
                        <span key={d} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 divide-x">
            <div className="flex flex-col items-center gap-1 py-4">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{members.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
            <div className="flex flex-col items-center gap-1 py-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{totalBookings}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total bookings</p>
            </div>
          </div>
        </div>

        {/* Members grid */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">Members</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => {
              const bookingInfo = bookingsPerContact.get(member.id)
              const sub = subPerContact.get(member.id)
              return (
                <Link
                  key={member.id}
                  href={`/panel/companies/${id}/${member.id}`}
                  className="group rounded-xl border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col gap-4"
                >
                  {/* Card header */}
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-foreground shrink-0">
                      {initials(member.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{member.full_name}</p>
                    </div>
                    {sub && <SubBadge ends_at={sub.ends_at} status={sub.status} />}
                  </div>

                  {/* Contact info */}
                  <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                    {member.email && (
                      <span className="flex items-center gap-2 truncate">
                        <Mail className="size-3 shrink-0" />{member.email}
                      </span>
                    )}
                    {member.phone && (
                      <span className="flex items-center gap-2">
                        <Phone className="size-3 shrink-0" />{member.phone}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3" />{bookingInfo?.count ?? 0} bookings
                    </span>
                    {bookingInfo?.lastDate && (
                      <span>
                        Last:{" "}
                        {new Date(bookingInfo.lastDate).toLocaleDateString("en-CH", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
