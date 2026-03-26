import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = createAdminClient()
  const { data: contact } = await admin
    .from("contacts")
    .select("full_name, email, phone, company")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (!contact) return NextResponse.json({})

  const [firstName, ...rest] = (contact.full_name ?? "").trim().split(" ")
  return NextResponse.json({
    firstName: firstName ?? "",
    lastName:  rest.join(" "),
    email:     contact.email ?? "",
    phone:     contact.phone ?? "",
    company:   contact.company ?? "",
  })
}
