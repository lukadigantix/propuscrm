import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import PhotoJobDetail, { type DbPhotoJob } from "./PhotoJobDetailClient"

export default async function PhotoJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: row } = await admin
    .from("bookings")
    .select("id, date, time, service, property_address, property_type, rooms, square_meters, status, contacts(full_name, company)")
    .eq("id", id)
    .maybeSingle()

  if (!row) return notFound()

  const contact = Array.isArray(row.contacts) ? row.contacts[0] : row.contacts
  const job: DbPhotoJob = {
    id: row.id,
    date: row.date,
    time: row.time ?? null,
    service: row.service,
    property_address: row.property_address ?? null,
    property_type: row.property_type ?? null,
    rooms: row.rooms ?? null,
    square_meters: row.square_meters ?? null,
    status: row.status,
    contact_name: contact?.full_name ?? "Unknown",
    contact_company: contact?.company ?? null,
  }

  return <PhotoJobDetail job={job} />
}
