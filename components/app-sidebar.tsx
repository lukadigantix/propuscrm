"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Camera, Box, CalendarDays, FileText, Users, Users2, ShieldCheck, Settings, CreditCard, Building2 } from "lucide-react"
import { GalleryVerticalEndIcon } from "lucide-react"

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  user: "User",
}

const navSettings = [
  { title: "Team",          url: "/panel/settings/team",    icon: <Users2 /> },
  { title: "Roles & Access", url: "/panel/settings/roles",   icon: <ShieldCheck /> },
  { title: "General",       url: "/panel/settings/general", icon: <Settings /> },
]

const navAdmin = [
  { title: "Contacts",      url: "/panel/contacts",      icon: <Users /> },
  { title: "Companies",     url: "/panel/companies",     icon: <Building2 /> },
  { title: "Bookings",      url: "/panel/bookings",      icon: <CalendarDays /> },
  { title: "Matterport",    url: "/panel/matterport",    icon: <Box /> },
  { title: "Photos",        url: "/panel/photos",        icon: <Camera /> },
  { title: "Invoices",      url: "/panel/invoices",      icon: <FileText /> },
  { title: "Subscriptions", url: "/panel/subscriptions", icon: <CreditCard /> },
]

// Clients only see their own bookings, subscription and invoices
// Photos and Matterport are added dynamically based on their booked services
function buildNavClient(services: string[]) {
  const items = [
    { title: "Bookings",     url: "/panel/bookings",      icon: <CalendarDays /> },
    { title: "Subscription", url: "/panel/subscription",  icon: <CreditCard /> },
  ]
  if (services.includes("photos"))     items.push({ title: "My Photos",     url: "/panel/my-photos",     icon: <Camera /> })
  if (services.includes("matterport")) items.push({ title: "My Matterport", url: "/panel/my-matterport", icon: <Box /> })
  items.push({ title: "Invoices", url: "/panel/invoices", icon: <FileText /> })
  return items
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; role: string; phone?: string; avatar?: string }
  clientServices?: string[]
}

export function AppSidebar({ user, clientServices = [], ...props }: AppSidebarProps) {
  const isClient = user.role === "user"
  const teams = [
    {
      name: "Propus CRM",
      logo: <GalleryVerticalEndIcon />,
      plan: ROLE_LABEL[user.role] ?? user.role,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={isClient ? buildNavClient(clientServices) : navAdmin} />
        {!isClient && <NavMain items={navSettings} label="Settings" />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: user.name, email: user.email, avatar: user.avatar ?? "", phone: user.phone ?? "" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
