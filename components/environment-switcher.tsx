"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
import { useGlobalSetting } from "@/lib/store"
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function EnvironmentSwitcher({
  environments,
}: {
  environments: {
    name: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const { selectedEnvironment, setSelectedEnvironment } = useGlobalSetting()

  // ✅ derive active environment from global state
  const activeEnvironment =
    environments.find((e) => e.name === selectedEnvironment) ?? environments[0]
  // Optional: initialize default once
  React.useEffect(() => {
    if (!selectedEnvironment && environments.length > 0) {
      setSelectedEnvironment(environments[0].name)
    }
  }, [selectedEnvironment, environments, setSelectedEnvironment])

  if (!activeEnvironment) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeEnvironment.name}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Environments
            </DropdownMenuLabel>

            {environments.map((environment, index) => (
              <DropdownMenuItem
                key={environment.name}
                onClick={() => {setSelectedEnvironment(environment.name)
                  toast.success(`Switched to ${environment.name}`)
                }
                } // ✅ global update
                className="gap-2 p-2"
              >
                {environment.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
