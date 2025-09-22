"use client"
import { ColumnDef } from "@tanstack/react-table"
import {IClientInfo} from "@/interfaces/controldb"
import { IapiInfo } from "@/interfaces/generic"

import Link from "next/link"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<IapiInfo<IClientInfo>>[] = [
   {  accessorKey: "clientName",
    header: "Client Name"
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "server",
    header: "Server Name",
    cell: ({ row }) => {
      const serverName = row.original.server
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
    accessorKey: "database",
    header: "Database",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
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


