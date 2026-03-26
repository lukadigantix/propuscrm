import { createAdminClient } from "@/lib/supabase/admin"
import SubscriptionsClientPage, { type DbSubContact } from "./SubscriptionsClientPage"
import type { SubscriptionStatus } from "@/lib/data/contacts"

export default async function SubscriptionsPage() {
  const admin = createAdminClient()

  const { data: rows } = await admin
    .from("subscriptions")
    .select("contact_id, status, starts_at, ends_at, contacts(id, full_name, company)")
    .eq("service", "matterport")
    .order("ends_at", { ascending: true })

  const contacts: DbSubContact[] = (rows ?? []).map((r: Record<string, unknown>) => {
    const contact = r.contacts as { id: string; full_name: string; company: string | null } | null
    return {
      id:            contact?.id ?? (r.contact_id as string),
      full_name:     contact?.full_name ?? "Unknown",
      company:       contact?.company ?? null,
      sub_starts_at: r.starts_at as string,
      sub_ends_at:   r.ends_at as string,
      sub_status:    (r.status as SubscriptionStatus) ?? "active",
    }
  })

  return <SubscriptionsClientPage contacts={contacts} />
}
