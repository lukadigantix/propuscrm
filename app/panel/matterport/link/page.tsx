import { SidebarTrigger } from "@/components/ui/sidebar"

export default function MatterportLinkPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-white px-6 py-4">
        <SidebarTrigger className="text-zinc-500 hover:text-zinc-900" />
        <h1 className="text-lg font-semibold text-zinc-900">Matterport — Link</h1>
      </header>

      <div className="p-6">
        <p className="text-sm text-zinc-500">No link configured yet.</p>
      </div>
    </div>
  )
}
