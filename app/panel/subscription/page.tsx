import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import SubscriptionClientView, { type DbSubscription } from "./SubscriptionClientView"

export default async function SubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return notFound()

  const admin = createAdminClient()

  // Get the contact linked to this auth user
  const { data: contact } = await admin
    .from("contacts")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (!contact) {
    return <SubscriptionClientView subscriptions={[]} />
  }

  const { data: rows } = await admin
    .from("subscriptions")
    .select("id, service, status, starts_at, ends_at, is_free")
    .eq("contact_id", contact.id)
    .order("starts_at", { ascending: false })

  const subscriptions: DbSubscription[] = (rows ?? []).map((r) => ({
    id:        r.id,
    service:   r.service,
    status:    r.status,
    starts_at: r.starts_at,
    ends_at:   r.ends_at,
    is_free:   r.is_free ?? false,
  }))

  return <SubscriptionClientView subscriptions={subscriptions} />
}
