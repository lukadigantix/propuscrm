import { createAdminClient } from "@/lib/supabase/admin"
import PhotosClientPage, { type DbPhotoJob } from "./PhotosClientPage"

export default async function PhotosPage() {
  const admin = createAdminClient()

  const { data: rows } = await admin
    .from("bookings")
    .select(`
      id, date, time, service, property_address, property_type, rooms, square_meters, status,
      contacts(full_name, company)
    `)
    .in("service", ["photos", "both"])
    .order("date", { ascending: false })

  const jobs: DbPhotoJob[] = (rows ?? []).map((r: Record<string, unknown>) => {
    const contact = r.contacts as { full_name: string; company: string | null } | null
    return {
      id:               r.id as string,
      date:             r.date as string,
      time:             (r.time as string) ?? null,
      service:          r.service as string,
      property_address: (r.property_address as string) ?? null,
      property_type:    (r.property_type as string) ?? null,
      rooms:            (r.rooms as string) ?? null,
      square_meters:    (r.square_meters as number) ?? null,
      status:           (r.status as string) ?? "Scheduled",
      contact_name:     contact?.full_name ?? "Unknown",
      contact_company:  contact?.company ?? null,
    }
  })

  return <PhotosClientPage jobs={jobs} />
}

