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

export const DocumentExtractionTasksSetting = [
  {
    env: "Test",

    "GetDocApiToken": {
      "Url": "https://dfidconfig.np.dayforcehcm.com/connect/token",
      "Method": "POST",
      "ContentType": "application/x-www-form-urlencoded",
      "GrantType": "client_credentials",
      "ClientSecret": "doc-api-test-clientsecret"
    },
    "SendDocBulkExport": {
      "Url": "https://docmgmt-docmgmtservice-usconf.np.dayforcehcm.com/BulkExport",
      "Method": "POST",
      "ContentType": "application/json",
      "sftpHostName": "ftstest01.dayforcehcm.com"
    },
    "GetDocBulkExportStatus": {
      "Url": "https://docmgmt-docmgmtservice-usconf.np.dayforcehcm.com/File/GetBulkExportStatus",
      "Method": "GET",
      "ContentType": "application/json"
    }
  },

  {
    env: "US",
    "GetDocApiToken": {
            "Url": "https://dfid.dayforcehcm.com/connect/token",
            "Method": "POST",
            "ContentType": "application/x-www-form-urlencoded",
            "GrantType": "client_credentials",
            "ClientSecret": "doc-api-prod-clientsecret"
        },
        "SendDocBulkExport": {
            "Url": "https://docmgmt-docmgmtservice-us.dayforcehcm.com/BulkExport",
            "Method": "POST",
            "ContentType": "application/json",
            "sftpHostName": "fts01.dayforcehcm.com"
        },
        "GetDocBulkExportStatus": {
            "Url": "https://docmgmt-docmgmtservice-us.dayforcehcm.com/File/GetBulkExportStatus",
            "Method": "GET",
            "ContentType": "application/json"
        }
  },
  {
    env: "Canada",
    
        "GetDocApiToken": {
            "Url": "https://dfid.dayforcehcm.com/connect/token",
            "Method": "POST",
            "ContentType": "application/x-www-form-urlencoded",
            "GrantType": "client_credentials",
            "ClientSecret": "doc-api-prod-clientsecret"
        },
        "SendDocBulkExport": {
            "Url": "https://docmgmt-docmgmtservice-can.dayforcehcm.com/BulkExport",
            "Method": "POST",
            "ContentType": "application/json",
            "sftpHostName": "canfts02.dayforcehcm.com"
        },
        "GetDocBulkExportStatus": {
            "Url": "https://docmgmt-docmgmtservice-can.dayforcehcm.com/File/GetBulkExportStatus",
            "Method": "GET",
            "ContentType": "application/json"
        }
  },
  {
    env: "Europe",
    "GetDocApiToken": {
            "Url": "https://dfid.dayforcehcm.com/connect/token",
            "Method": "POST",
            "ContentType": "application/x-www-form-urlencoded",
            "GrantType": "client_credentials",
            "ClientSecret": "doc-api-prod-clientsecret"
        },
        "SendDocBulkExport": {
            "Url": "https://docmgmt-docmgmtservice-eur.dayforcehcm.com/BulkExport",
            "Method": "POST",
            "ContentType": "application/json",
            "sftpHostName": "eurftsw.dayforcehcm.com"
        },
        "GetDocBulkExportStatus": {
            "Url": "https://docmgmt-docmgmtservice-eur.dayforcehcm.com/File/GetBulkExportStatus",
            "Method": "GET",
            "ContentType": "application/json"
        }
  },
  {
    env: "Australia",
    "GetDocApiToken": {
            "Url": "https://dfid.dayforcehcm.com/connect/token",
            "Method": "POST",
            "ContentType": "application/x-www-form-urlencoded",
            "GrantType": "client_credentials",
            "ClientSecret": "doc-api-prod-clientsecret"
        },
        "SendDocBulkExport": {
            "Url": "https://docmgmt-docmgmtservice-aus.dayforcehcm.com/BulkExport",
            "Method": "POST",
            "ContentType": "application/json",
            "sftpHostName": "ausfts02.dayforcehcm.com"
        },
        "GetDocBulkExportStatus": {
            "Url": "https://docmgmt-docmgmtservice-aus.dayforcehcm.com/File/GetBulkExportStatus",
            "Method": "GET",
            "ContentType": "application/json"
        }
  }
]