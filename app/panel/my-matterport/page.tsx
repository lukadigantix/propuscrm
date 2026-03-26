import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import MyMatterportClientView from "./MyMatterportClientView"

export type DbClientMatterport = {
  id: string
  date: string
  time: string | null
  property_address: string | null
  status: string
  matterport_link: string | null
}

export default async function MyMatterportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const admin = createAdminClient()

  const { data: contact } = await admin
    .from("contacts")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (!contact) return <MyMatterportClientView bookings={[]} />

  const { data: rows } = await admin
    .from("bookings")
    .select("id, date, time, property_address, status, matterport_link")
    .eq("contact_id", contact.id)
    .in("service", ["matterport", "both"])
    .order("date", { ascending: false })

  const bookings: DbClientMatterport[] = (rows ?? []).map((r) => ({
    id: r.id,
    date: r.date,
    time: r.time ?? null,
    property_address: r.property_address ?? null,
    status: r.status,
    matterport_link: r.matterport_link ?? null,
  }))

  return <MyMatterportClientView bookings={bookings} />
}
