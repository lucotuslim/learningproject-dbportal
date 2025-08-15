"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
// import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {AppConfig} from "@/app/config/appsetting";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={AppConfig.teams} />  */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={AppConfig.navMain} />
        <NavProjects projects={AppConfig.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={AppConfig.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
