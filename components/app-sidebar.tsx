"use client"

import * as React from "react"

import { NavConfiguration } from "@/components/nav-configuration"

//import { NavUser } from "@/components/nav-user"
// import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {AppConfig} from "@/config/appsetting";
import { NavManagements } from "./nav-managements"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={AppConfig.teams} />  */}
      </SidebarHeader>
      <SidebarContent>
        <NavConfiguration items={AppConfig.navConfiguration} />
        <NavManagements managements={AppConfig.NavManagements} />
        {/* <NavProjects projects={AppConfig.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={AppConfig.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
