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

const navMain = [
  { title: "Contacts",      url: "/panel/contacts",      icon: <Users /> },
  { title: "Companies",     url: "/panel/companies",     icon: <Building2 /> },
  { title: "Bookings",      url: "/panel/bookings",      icon: <CalendarDays /> },
  { title: "Matterport", url: "/panel/matterport", icon: <Box /> },
  { title: "Photos",        url: "/panel/photos",        icon: <Camera /> },
  { title: "Invoices",      url: "/panel/invoices",      icon: <FileText /> },
  { title: "Subscriptions", url: "/panel/subscriptions", icon: <CreditCard /> },
]

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; role: string }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
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
        <NavMain items={navMain} />
        <NavMain items={navSettings} label="Settings" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: user.name, email: user.email, avatar: "" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
