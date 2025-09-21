"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {  type LucideIcon } from "lucide-react"

// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavManagements({
managements}: {
  managements: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  

  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Managements</SidebarGroupLabel>
      <SidebarMenu>
        {managements.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              tooltip={item.name}
              className={
                pathname === item.url
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <Link href={item.url}>
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )

}
