"use client"

import { ColumnDef } from "@tanstack/react-table"
import {IapiControlDbUrlWithSqlServer} from "@/interfaces/controldb"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<IapiControlDbUrlWithSqlServer>[] = [
 
  {  accessorKey: "Controldburl",
    header: "Control DB URL"
  },
  {
    accessorKey: "MachineName",
    header: "Machine Name",
  },
  {
    accessorKey: "ServerName",
    header: "Server Name",
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
  }
]


