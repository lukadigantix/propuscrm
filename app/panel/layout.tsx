import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import PageTransition from "@/components/page-transition"

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = { name: "", email: user?.email ?? "", role: "user" }

  if (user?.id) {
    const admin = createAdminClient()
    const { data } = await admin
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single()
    if (data) {
      profile = {
        name: data.full_name ?? "",
        email: user.email ?? "",
        role: data.role,
      }
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar user={profile} />
      <SidebarInset>
        <PageTransition>
          {children}
        </PageTransition>
      </SidebarInset>
    </SidebarProvider>
  )
}
