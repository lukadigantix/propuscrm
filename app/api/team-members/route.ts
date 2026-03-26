import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { TeamMember } from "@/app/booking/types"

const AVATAR_COLORS = [
  "from-amber-400 to-orange-500",
  "from-sky-400 to-blue-500",
  "from-indigo-400 to-violet-500",
  "from-emerald-400 to-green-500",
  "from-rose-400 to-pink-500",
]

// GET /api/team-members
export async function GET() {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("role", ["admin", "super_admin"])
      .eq("is_active", true)
      .order("full_name")

    if (error) throw error

    const members: TeamMember[] = (data ?? []).map((profile, i) => ({
      id: profile.id,
      name: profile.full_name ?? "Team Member",
      role: "Specialist",
      primarySkill: "both",
      avatar: "",
      avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
    }))

    return NextResponse.json(members)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
