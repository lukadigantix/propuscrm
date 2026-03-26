import { SidebarTrigger } from "@/components/ui/sidebar"
import { ContactAvatar } from "@/components/contact-avatar"
import { Phone, Box, Camera } from "lucide-react"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { AddMemberSheet } from "./AddMemberSheet"

type Role = "super_admin" | "admin" | "user"

const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  user: "User",
}

const ROLE_STYLE: Record<Role, string> = {
  super_admin: "bg-primary text-primary-foreground",
  admin: "bg-muted text-muted-foreground",
  user: "bg-blue-50 text-blue-700",
}

export default async function TeamPage() {
  const admin = createAdminClient()
  const { data: members } = await admin
    .from("profiles")
    .select("id, full_name, phone, role, specializations, created_at, avatar_url")
    .in("role", ["super_admin", "admin"])
    .order("created_at", { ascending: true })

  const list = members ?? []

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <h1 className="text-lg font-semibold text-foreground">Team</h1>
        </div>
        <AddMemberSheet />
      </header>

      <div className="p-6">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <p className="text-sm">No team members yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card divide-y">
            {list.map((member) => (
              <div key={member.id} className="flex items-center gap-4 px-6 py-4">
                <Link href={`/panel/settings/team/${member.id}`} className="flex items-center gap-4 flex-1 min-w-0 group">
                  <ContactAvatar name={member.full_name ?? "?"} avatarUrl={member.avatar_url ?? null} size="lg" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground group-hover:underline">
                        {member.full_name || "—"}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLE[member.role as Role]}`}>
                        {ROLE_LABEL[member.role as Role]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Member since {new Date(member.created_at).toLocaleDateString("en-CH", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                </Link>

                {member.phone && (
                  <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <Phone className="size-3" />{member.phone}
                  </div>
                )}

                {(member.specializations ?? []).length > 0 && (
                  <div className="hidden md:flex items-center gap-1.5 shrink-0">
                    {(member.specializations as string[]).map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                        {s === "matterport" ? <Box className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                        {s === "matterport" ? "Matterport" : "Photos"}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
