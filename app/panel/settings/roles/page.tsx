import React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Check, X } from "lucide-react"

const PERMISSIONS = [
  {
    category: "Bookings",
    rows: [
      { label: "View all bookings",           super_admin: true,  admin: true,  client: false },
      { label: "View own bookings",           super_admin: true,  admin: true,  client: true  },
      { label: "Create / edit bookings",      super_admin: true,  admin: false, client: false },
      { label: "Delete bookings",             super_admin: true,  admin: false, client: false },
    ],
  },
  {
    category: "Photos",
    rows: [
      { label: "View all photo tours",        super_admin: true,  admin: true,  client: false },
      { label: "View own photo tour",         super_admin: true,  admin: true,  client: true  },
      { label: "Select / reject photos",      super_admin: false, admin: false, client: true  },
      { label: "Add comments",               super_admin: true,  admin: true,  client: true  },
      { label: "Upload photos",               super_admin: true,  admin: true,  client: false },
      { label: "Delete photos",               super_admin: true,  admin: false, client: false },
      { label: "Change tour status",          super_admin: true,  admin: true,  client: false },
    ],
  },
  {
    category: "Matterport",
    rows: [
      { label: "View all Matterport tours",   super_admin: true,  admin: true,  client: false },
      { label: "View own Matterport tour",    super_admin: true,  admin: true,  client: true  },
      { label: "Add comments",               super_admin: true,  admin: true,  client: true  },
      { label: "Add / edit Matterport link",  super_admin: true,  admin: true,  client: false },
      { label: "Delete tours",                super_admin: true,  admin: false, client: false },
    ],
  },
  {
    category: "Contacts",
    rows: [
      { label: "View contacts",               super_admin: true,  admin: false, client: false },
      { label: "Create / edit contacts",      super_admin: true,  admin: false, client: false },
      { label: "Delete contacts",             super_admin: true,  admin: false, client: false },
    ],
  },
  {
    category: "Invoices",
    rows: [
      { label: "View all invoices",           super_admin: true,  admin: false, client: false },
      { label: "View own invoices",           super_admin: true,  admin: false, client: true  },
      { label: "Create / approve invoices",   super_admin: true,  admin: false, client: false },
      { label: "Send invoices",               super_admin: true,  admin: false, client: false },
    ],
  },
  {
    category: "Subscriptions",
    rows: [
      { label: "View all subscriptions",      super_admin: true,  admin: false, client: false },
      { label: "View own subscription",       super_admin: true,  admin: false, client: true  },
      { label: "Renew own subscription",      super_admin: true,  admin: false, client: true  },
      { label: "Manage client subscriptions", super_admin: true,  admin: false, client: false },
      { label: "Send reminder emails",        super_admin: true,  admin: false, client: false },
    ],
  },
  {
    category: "Settings",
    rows: [
      { label: "Manage team members",         super_admin: true,  admin: false, client: false },
      { label: "View roles & access",         super_admin: true,  admin: false, client: false },
      { label: "Edit general settings",       super_admin: true,  admin: false, client: false },
    ],
  },
]

function Cell({ value }: { value: boolean }) {
  return value
    ? <Check className="size-4 text-emerald-500 mx-auto" />
    : <X className="size-4 text-muted-foreground mx-auto" />
}

export default function RolesPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card px-6 py-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <h1 className="text-lg font-semibold text-foreground">Roles & Access</h1>
      </header>

      <div className="p-6">
        <p className="text-sm text-muted-foreground mb-6">
          Overview of what each role can do. Roles are assigned per team member on the Team page.
        </p>

        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-background">
                <th className="px-6 py-3 text-left font-medium text-muted-foreground w-full">Permission</th>
                <th className="px-6 py-3 text-center font-semibold text-foreground whitespace-nowrap">Super Admin</th>
                <th className="px-6 py-3 text-center font-semibold text-foreground whitespace-nowrap">Admin</th>
                <th className="px-6 py-3 text-center font-semibold text-foreground whitespace-nowrap">Client</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((section) => (
                <React.Fragment key={section.category}>
                  <tr className="border-t border-b bg-background/60">
                    <td colSpan={4} className="px-6 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {section.category}
                    </td>
                  </tr>
                  {section.rows.map((row) => (
                    <tr key={row.label} className="border-b last:border-0 hover:bg-background transition-colors">
                      <td className="px-6 py-3 text-foreground">{row.label}</td>
                      <td className="px-6 py-3 text-center"><Cell value={row.super_admin} /></td>
                      <td className="px-6 py-3 text-center"><Cell value={row.admin} /></td>
                      <td className="px-6 py-3 text-center"><Cell value={row.client} /></td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

