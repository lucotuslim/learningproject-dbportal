import { NavManagements } from "@/components/nav-managements"
import {
  type LucideIcon,
} from "lucide-react"

import {
  DatabaseIcon,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  SquareTerminal,
  Bot,
  BookOpen,
  Settings2,
  ServerCog,
  Frame,
  PieChart,
  Map
} from "lucide-react"

export const AppConfig = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navConfiguration: [
    {
      title: "Control Db",
      url: "/appconfiguration/controldb",
      icon: SquareTerminal
    },


    {
      title: "Client Info",
      url: "/appconfiguration/clientinfo",
      icon: SquareTerminal
    },

    {
      title: "App Db",
      url: "/appconfiguration/appdb",
      icon: SquareTerminal
    },

  ],
  NavManagements: [
    {
      name: "Servers",
      url: "/managements/servers",
      icon: ServerCog
    },
        {
      name: "Databases",
      url: "/managements/databases",
      icon: DatabaseIcon
    },
  ],


  tasks: [
    {
      name: "Document Extraction",
      url: "/tasks/documentextraction",
      icon: Frame,
    },
    // {
    //   name: "Sales & Marketing",
    //   url: "#",
    //   icon: PieChart,
    // },
    // {
    //   name: "Travel",
    //   url: "#",
    //   icon: Map,
    // },
  ],


  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}
