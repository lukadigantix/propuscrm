"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { sendPhotosReady } from "@/lib/email/photos-ready"
import { revalidatePath } from "next/cache"

export async function deliverPhotos(bookingId: string) {
  const admin = createAdminClient()

  const { data: booking } = await admin
    .from("bookings")
    .select("id, property_address, contacts(full_name, email)")
    .eq("id", bookingId)
    .single()

  if (!booking) throw new Error("Booking not found")

  await admin
    .from("bookings")
    .update({ status: "Delivered" })
    .eq("id", bookingId)

  const contact = (Array.isArray(booking.contacts) ? booking.contacts[0] : booking.contacts) as {
    full_name: string
    email: string | null
  } | null

  if (contact?.email) {
    await sendPhotosReady({
      to: contact.email,
      clientName: contact.full_name,
      address: booking.property_address ?? "",
      panelLink: `${process.env.NEXT_PUBLIC_SITE_URL}/panel/my-photos`,
    })
  }

  revalidatePath(`/panel/photos/${bookingId}`)
}
