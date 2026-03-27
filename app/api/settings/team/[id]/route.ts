import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getAuthUser } from "@/lib/supabase/server"

export type TeamMemberDetail = {
  id: string
  full_name: string | null
  phone: string | null
  role: string
  specializations: string[] | null
  created_at: string
  avatar_url: string | null
  email: string | null
  bookings: {
    id: string
    date: string
    time: string | null
    property_address: string | null
    status: string
    service: string
  }[]
}

// GET /api/settings/team/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    const admin = createAdminClient()

    const [{ data: member }, { data: authUser }] = await Promise.all([
      admin
        .from("profiles")
        .select("id, full_name, phone, role, specializations, created_at, avatar_url")
        .eq("id", id)
        .single(),
      admin.auth.admin.getUserById(id),
    ])

    if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const { data: assignedBookings } = await admin
      .from("bookings")
      .select("id, date, time, property_address, status, service")
      .eq("assigned_team_member", member.full_name ?? "")
      .order("date", { ascending: false })
      .limit(20)

    const detail: TeamMemberDetail = {
      ...member,
      email: authUser?.user?.email ?? null,
      bookings: assignedBookings ?? [],
    }

    console.log(`[/api/settings/team/${id}] user: ${user.email} | bookings: ${detail.bookings.length}`)
    return NextResponse.json(detail)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
