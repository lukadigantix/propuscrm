import { SidebarTrigger } from "@/components/ui/sidebar"
import { ContactAvatar } from "@/components/contact-avatar"
import { ArrowLeft, Phone, Mail, Camera, Box, CalendarDays, Pencil, UserX } from "lucide-react"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { notFound, redirect } from "next/navigation"
import { deleteTeamMember } from "../actions"

const SPEC_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
  matterport: { label: "Matterport", icon: <Box className="w-3.5 h-3.5" /> },
  photos:     { label: "Photos",     icon: <Camera className="w-3.5 h-3.5" /> },
}

export default async function TeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const [{ data: member }, { data: authUser }] = await Promise.all([
    admin.from("profiles").select("id, full_name, phone, role, specializations, created_at").eq("id", id).single(),
    admin.auth.admin.getUserById(id),
  ])

  if (!member) notFound()

  const email = authUser?.user?.email ?? null
  const specs: string[] = member.specializations ?? []

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card px-6 py-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <Link
          href="/panel/settings/team"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Team
        </Link>
      </header>

      <div className="p-6 flex flex-col gap-6">

        {/* Header card */}
        <div className="rounded-xl border bg-card p-6 flex items-center gap-5">
          <ContactAvatar name={member.full_name ?? "?"} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground">{member.full_name || "—"}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {member.role === "super_admin" ? "Super Admin" : "Admin"}
              {" · "}Member since {new Date(member.created_at).toLocaleDateString("en-CH", { month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-sm text-zinc-700 hover:bg-background transition">
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <form
              action={async () => {
                "use server"
                await deleteTeamMember(id)
                redirect("/panel/settings/team")
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-red-200 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <UserX className="w-3.5 h-3.5" />
                Remove
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="flex flex-col gap-4">

            {/* Contact info */}
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-sm font-medium text-foreground mb-4">Contact Info</h2>
              <div className="flex flex-col gap-3 text-sm">
                {email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <a href={`mailto:${email}`} className="text-zinc-700 hover:underline break-all">{email}</a>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <a href={`tel:${member.phone}`} className="text-zinc-700 hover:underline">{member.phone}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Specialization */}
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-sm font-medium text-foreground mb-4">Specialization</h2>
              {specs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No specialization assigned.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {specs.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-sm text-zinc-700">
                      <span className="text-muted-foreground">{SPEC_LABEL[s]?.icon}</span>
                      {SPEC_LABEL[s]?.label ?? s}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right column — bookings placeholder */}
          <div className="md:col-span-2">
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h2 className="text-sm font-medium text-foreground">Assigned Bookings</h2>
                <span className="text-xs text-muted-foreground">Coming soon</span>
              </div>
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <CalendarDays className="w-7 h-7 opacity-30" />
                <p className="text-sm">No bookings assigned yet.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
