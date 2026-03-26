import { createAdminClient } from "@/lib/supabase/admin"
import ContactsClientPage, { type DbContact } from "./ContactsClientPage"

export default async function ContactsPage() {
  const admin = createAdminClient()
  const { data: rows } = await admin
    .from("contacts")
    .select(`
      id, full_name, email, phone, company_id, created_at,
      company:companies(id, name),
      bookings(date),
      subscriptions(service, status, ends_at)
    `)
    .order("created_at", { ascending: false })

  const dbContacts: DbContact[] = (rows ?? []).map((r: Record<string, unknown>) => {
    const bookingRows = (r.bookings as { date: string }[]) ?? []
    const lastBooking = bookingRows
      .map((b) => b.date)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null

    const subs = (r.subscriptions as { service: string; status: string; ends_at: string }[]) ?? []
    const matterportSub = subs.find((s) => s.service === "matterport" && s.status === "active") ?? null

    const company = r.company as { id: string; name: string } | null

    return {
      id: r.id as string,
      full_name: (r.full_name as string) ?? "—",
      email: (r.email as string) ?? null,
      phone: (r.phone as string) ?? null,
      company_id: (r.company_id as string) ?? null,
      company_name: company?.name ?? null,
      created_at: r.created_at as string,
      booking_count: bookingRows.length,
      last_booking_date: lastBooking,
      matterport_sub_ends_at: matterportSub?.ends_at ?? null,
    }
  })

  return <ContactsClientPage dbContacts={dbContacts} />
}
