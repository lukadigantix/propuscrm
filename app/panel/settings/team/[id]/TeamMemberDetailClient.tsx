"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ContactAvatar } from "@/components/contact-avatar"
import { ArrowLeft, Phone, Mail, Camera, Box, CalendarDays, Pencil, UserX } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { deleteTeamMember } from "../actions"
import type { TeamMemberDetail } from "@/app/api/settings/team/[id]/route"

const SPEC_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
  matterport: { label: "Matterport", icon: <Box className="w-3.5 h-3.5" /> },
  photos:     { label: "Photos",     icon: <Camera className="w-3.5 h-3.5" /> },
}

const STATUS_COLOR: Record<string, string> = {
  Scheduled:     "bg-amber-100 text-amber-800",
  "In Progress": "bg-purple-100 text-purple-800",
  Delivered:     "bg-green-100 text-green-800",
  Invoiced:      "bg-blue-100 text-blue-800",
  Cancelled:     "bg-red-100 text-red-800",
}

export function TeamMemberDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [deleting, setDeleting] = useState(false)

  const { data: member, isLoading } = useQuery<TeamMemberDetail | null>({
    queryKey: ["settings-team-member", id],
    queryFn: async () => {
      const res = await fetch(`/api/settings/team/${id}`)
      if (res.status === 404) return null
      return res.json()
    },
    retry: false,
  })

  async function handleDelete() {
    if (!confirm("Remove this team member?")) return
    setDeleting(true)
    await deleteTeamMember(id)
    queryClient.invalidateQueries({ queryKey: ["settings-team"] })
    router.push("/panel/settings/team")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card px-6 py-4">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <Skeleton className="h-4 w-16" />
        </header>
        <div className="p-6 flex flex-col gap-6">
          <div className="rounded-xl border bg-card p-6 flex items-center gap-5">
            <Skeleton className="size-16 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-4">
              <Skeleton className="rounded-xl h-28" />
              <Skeleton className="rounded-xl h-24" />
            </div>
            <div className="md:col-span-2">
              <Skeleton className="rounded-xl h-64" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Team member not found.</p>
      </div>
    )
  }

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
          <ContactAvatar name={member.full_name ?? "?"} avatarUrl={member.avatar_url ?? null} size="lg" />
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
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-red-200 text-sm text-red-600 hover:bg-red-50 transition disabled:opacity-50"
            >
              <UserX className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="flex flex-col gap-4">

            {/* Contact info */}
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-sm font-medium text-foreground mb-4">Contact Info</h2>
              <div className="flex flex-col gap-3 text-sm">
                {member.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <a href={`mailto:${member.email}`} className="text-zinc-700 hover:underline break-all">{member.email}</a>
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

          {/* Right column — bookings */}
          <div className="md:col-span-2">
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h2 className="text-sm font-medium text-foreground">Assigned Bookings</h2>
                <span className="text-xs text-muted-foreground">{member.bookings.length} total</span>
              </div>
              {member.bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                  <CalendarDays className="w-7 h-7 opacity-30" />
                  <p className="text-sm">No bookings assigned yet.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {member.bookings.map((b) => (
                    <Link
                      key={b.id}
                      href={`/panel/bookings/${b.id}`}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{b.property_address ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(b.date).toLocaleDateString("en-CH", { day: "numeric", month: "short", year: "numeric" })}
                            {b.time ? ` · ${b.time.slice(0, 5)}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[b.status] ?? "bg-muted text-zinc-700"}`}>
                        {b.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
