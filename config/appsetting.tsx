
import { NavManagements } from "@/components/nav-managements"
import {
  type LucideIcon,
} from "lucide-react"

import {
  DatabaseIcon,

  SquareTerminal,
  HeartHandshake,
  Frame,
  PieChart,
  Map
} from "lucide-react"

export const AppConfig = {
  environments: [
    {
      name: "nonprod",
      description: "Non Production Environment"
    },
    {
      name: "preprod",
      description: "Pre Production Environment"
    },
    {
      name: "prod",
      description: "Production Environment"
    }
  ],
  // user: {
  //   name: "shadcn",
  //   email: "m@example.com",
  //   avatar: "/avatars/shadcn.jpg",
  // },

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
    // {
    //   name: "Servers",
    //   url: "/managements/servers",
    //   icon: ServerCog
    // },
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
    {
      name: "Customer Permission",
      url: "/tasks/customerpermission",
      icon: HeartHandshake,
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


// export const DocumentExtractionTasksSetting: IDocumentConfig[] = [
//   {
//     env: "TestMe",
//     "GetDocApiToken": {
//       //"Url": "https://dfidconfig.np.dayforcehcm.com/connect/token",
//       "Url": "https://mock-6b1eff0fb9a847e2ae072c2de9e224da.mock.insomnia.run/mstoken",
//       "Method": "POST",
//       "ContentType": "application/x-www-form-urlencoded",
//       "GrantType": "client_credentials",
//       "ClientSecret": "doc-api-test-clientsecret"
//     },
//     "SendDocBulkExport": {
//       "Url": "https://mock-6b1eff0fb9a847e2ae072c2de9e224da.mock.insomnia.run/msbulkexport",
//       "Method": "POST",
//       "ContentType": "application/json",
//       "sftpHostName": "ftstest01.test.com"
//     },
//     "GetDocBulkExportStatus": {
//       "Url": "https://mock-6b1eff0fb9a847e2ae072c2de9e224da.mock.insomnia.run/msbulkexport/status",
//       "Method": "GET",
//       "ContentType": "application/json"
//     }
//   }
// ]