"use client"
import { ColumnDef } from "@tanstack/react-table"
import {ISqlServerInstance} from "@/interfaces/generic"
import { IapiInfo } from "@/interfaces/generic"

import Link from "next/link"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<IapiInfo<ISqlServerInstance>>[] = [
   {  accessorKey: "apiurl",
    header: "Control DB URL"
  },
  {
    accessorKey: "MachineName",
    header: "Machine Name",
  },
  {
    accessorKey: "ServerName",
    header: "Server Name",
    cell: ({ row }) => {
      const serverName = row.original.ServerName
        if (!serverName) return null
      return (
        <Link
          href={`/managements/servers/${serverName}`}
          className="text-blue-600 hover:underline"
        >
          {serverName}
        </Link>
      )
    }
  },
  {
    accessorKey: "Edition",
    header: "Edition",
  },
  {
    accessorKey: "ProductVersion",
    header: "Product Version",
  },
  {
    accessorKey: "EngineEdition",
    header: "Engine Edition",
  },
  {
    accessorKey: "ClusterStatus",
    header: "Cluster Status",
  },
  {
    accessorKey: "AuthenticationMode",
    header: "Authentication Mode",
  }, 

  {
    accessorKey: "message",
    header: "Message",
  },
  {
    accessorKey: "error",
    header: "Error?",
  }
]


