"use client"
import { ColumnDef } from "@tanstack/react-table"
import {IServerInfoDetails} from "@/interfaces/server"
import { IapiInfo } from "@/interfaces/generic"

import Link from "next/link"

export const columns: ColumnDef<IapiInfo<IServerInfoDetails>>[] = [
   {  accessorKey: "apiurl",
    header: "Api Url"
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
    accessorKey: "apitype",
    header: "ApiType",
  },
  {
    accessorKey: "Version",
    header: "Sql Server Version",
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


