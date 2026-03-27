import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getAuthUser } from "@/lib/supabase/server"
import { createAdminClient, getProfile } from "@/lib/supabase/admin"
import PageTransition from "@/components/page-transition"

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()

  let profile = { name: "", email: user?.email ?? "", role: "user", phone: "", avatar: "" }
  let clientServices: string[] = []

  if (user?.id) {
    const data = await getProfile(user.id)
    if (data) {
      profile = {
        name: data.full_name ?? "",
        email: user.email ?? "",
        role: data.role,
        phone: data.phone ?? "",
        avatar: data.avatar_url ?? "",
      }
    }

    // For clients: find which services they have booked so we can show the right nav items
    if (data?.role === "user") {
      const admin = createAdminClient()
      const { data: contact } = await admin
        .from("contacts")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle()

      if (contact) {
        const { data: bookings } = await admin
          .from("bookings")
          .select("service")
          .eq("contact_id", contact.id)

        const services = new Set<string>()
        for (const b of bookings ?? []) {
          if (b.service === "photos" || b.service === "both") services.add("photos")
          if (b.service === "matterport" || b.service === "both") services.add("matterport")
        }
        clientServices = [...services]
      }
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar user={profile} clientServices={clientServices} />
      <SidebarInset>
        <PageTransition>
          {children}
        </PageTransition>
      </SidebarInset>
    </SidebarProvider>
  )
}
