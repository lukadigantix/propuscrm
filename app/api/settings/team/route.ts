import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getAuthUser } from "@/lib/supabase/server"

export type TeamMemberProfile = {
  id: string
  full_name: string | null
  phone: string | null
  role: string
  specializations: string[] | null
  created_at: string
  avatar_url: string | null
}

// GET /api/settings/team
export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("profiles")
      .select("id, full_name, phone, role, specializations, created_at, avatar_url")
      .in("role", ["super_admin", "admin"])
      .order("created_at", { ascending: true })

    if (error) throw error

    const members: TeamMemberProfile[] = data ?? []
    console.log(`[/api/settings/team] user: ${user.email} | returned: ${members.length} members`)

    return NextResponse.json(members)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
