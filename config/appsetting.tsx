import {
type LucideIcon,
} from "lucide-react"

import {
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  SquareTerminal,
  Bot,
  BookOpen,
  Settings2,
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
      title: "App Db",
      url: "/appconfiguration/appdb",
      icon: SquareTerminal
    }, 

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
