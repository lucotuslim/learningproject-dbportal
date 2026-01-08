"use client"

import * as React from "react"

// import { NavConfiguration } from "@/components/nav-configuration"

//import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {AppConfig} from "@/config/appsetting";
import { NavManagements } from "./nav-managements"
import { NavTasks } from "./nav-tasks";
import { EnvironmentSwitcher } from "./environment-switcher"
import Link from "next/link";
import { Home, type LucideIcon } from "lucide-react";
const HomeIcon: LucideIcon = Home;
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <EnvironmentSwitcher environments={AppConfig.environments} /> 
      </SidebarHeader>
      <SidebarContent>
        {/* <NavConfiguration items={AppConfig.navConfiguration} /> */}
        <NavManagements managements={AppConfig.NavManagements} />
        <NavTasks tasks={AppConfig.tasks} />
      </SidebarContent>
      <SidebarFooter>
 <Link
  href="/"
  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
>
  <HomeIcon className="h-4 w-4" />
  <span>Home</span>
</Link>

      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
